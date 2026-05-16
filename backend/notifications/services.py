"""
Notification service — the central hub for creating and dispatching notifications.
Handles database persistence, WebSocket broadcast, and optional email delivery.
"""
import logging
from django.conf import settings
from .email_providers import send_transactional_email
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
            html_message = f"""
            <html>
                <body style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <div style="background-color: #BA7517; padding: 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">INVESTO</h1>
                        </div>
                        <div style="padding: 40px 32px;">
                            <h2 style="color: #333333; margin-top: 0; font-size: 20px;">{title}</h2>
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Hi {user.first_name or user.username},</p>
                            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 32px; padding: 16px; background-color: #f9f9f9; border-left: 4px solid #BA7517; border-radius: 4px;">
                                {message}
                            </p>
                            <a href="{settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #BA7517; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">Go to Dashboard</a>
                        </div>
                        <div style="background-color: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">&copy; {datetime.now().year} Investo Ecosystem. All rights reserved.</p>
                            <p style="color: #999999; font-size: 12px; margin: 8px 0 0;">You received this because you opted into important alerts.</p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            sent = send_transactional_email(
                to_email=user.email,
                subject=f"Investo: {title}",
                plain_body=f"Hi {user.first_name or user.username},\n\n{message}\n\nBest,\nInvesto Team",
                html_body=html_message,
            )
            if sent:
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
