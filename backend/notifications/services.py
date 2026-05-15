"""
Notification service — the central hub for creating and dispatching notifications.
Handles database persistence, WebSocket broadcast, and optional email delivery.
"""
import logging
from django.core.mail import send_mail
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import datetime

from .models import Notification
from investo_backend.mongodb import mongo_logger

logger = logging.getLogger(__name__)


def create_notification(user, notification_type, title, message, metadata=None, send_email=False):
    """
    Create a notification and optionally send it via WebSocket and email.
    Also logs the activity to MongoDB for polyglot persistence (FYP Requirement).
    """
    # 1. Create database record (Relational - Postgres)
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        metadata=metadata or {},
    )

    # 2. Log to MongoDB (NoSQL - Activity Log)
    try:
        mongo_logger.log_event(
            event_type=notification_type,
            message=f"Notification: {title}",
            metadata={
                "user_id": user.id,
                "username": user.username,
                "notif_id": notification.id,
                "is_email_requested": send_email,
                **(metadata or {})
            }
        )
    except Exception as e:
        logger.warning(f"[NOTIF] MongoDB logging failed: {e}")

    # 3. Broadcast via WebSocket
    try:
        channel_layer = get_channel_layer()
        notification_data = {
            'id': notification.id,
            'type': notification.notification_type,
            'notification_type': notification.notification_type,
            'title': notification.title,
            'message': notification.message,
            'metadata': notification.metadata,
            'is_read': False,
            'created_at': notification.created_at.isoformat() if notification.created_at else datetime.now().isoformat(),
        }

        async_to_sync(channel_layer.group_send)(
            f'notifications_{user.id}',
            {
                'type': 'send_notification',
                'data': notification_data,
            }
        )
        logger.info(f"[NOTIF] WebSocket sent to user {user.username}: {title}")
    except Exception as e:
        logger.warning(f"[NOTIF] WebSocket broadcast failed for user {user.username}: {e}")

    # 4. Send email if requested
    if send_email and user.email:
        try:
            send_mail(
                subject=f"Investo: {title}",
                message=f"Hi {user.first_name or user.username},\n\n{message}\n\nBest,\nInvesto Team",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            notification.is_email_sent = True
            notification.save(update_fields=['is_email_sent'])
            logger.info(f"[NOTIF] Email sent to {user.email}: {title}")
        except Exception as e:
            logger.error(f"[NOTIF] Email failed for {user.email}: {e}")

    return notification


def get_unread_count(user):
    """Get count of unread notifications for a user."""
    return Notification.objects.filter(user=user, is_read=False).count()


def mark_all_read(user):
    """Mark all notifications as read for a user. Compatible with USE_TZ=False."""
    now = datetime.now()
    return Notification.objects.filter(
        user=user, is_read=False
    ).update(is_read=True, read_at=now)
