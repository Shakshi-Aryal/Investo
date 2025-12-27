from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from .models import Reminder
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_reminder_emails():
    now = timezone.localtime()
    logger.info(f"Checking reminders at {now}")

    reminders = Reminder.objects.filter(
        date=now.date(),
        time__hour=now.hour,
        time__minute=now.minute,
        email_notify=True,
        is_completed=False
    )
    logger.info(f"Found {reminders.count()} reminders")

    for r in reminders:
        try:
            send_mail(
                subject=f"⏰ Reminder: {r.title}",
                message=(
                    f"Hi {r.user.first_name or r.user.username},\n\n"
                    f"It's time to do:\n"
                    f"{r.title}\n\n"
                    f"{r.description}"
                ),
                from_email=None,  # uses DEFAULT_FROM_EMAIL in settings.py
                recipient_list=[r.user.email],
                fail_silently=False,
            )
            logger.info(f"Email sent for {r.title} to {r.user.email}")
        except Exception as e:
            logger.error(f"Failed to send email for {r.title}: {e}")
