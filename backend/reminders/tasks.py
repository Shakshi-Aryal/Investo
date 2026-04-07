from datetime import datetime
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Reminder
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_reminder_emails():
    # Since USE_TZ = False, datetime.now() gives local server time
    now = datetime.now()
    current_date = now.date()
    
    logger.info(f"--- SCANNING DB: {current_date} at {now.hour:02d}:{now.minute:02d} ---")

    # Filter for exact date and time (matching hour/minute)
    reminders = Reminder.objects.filter(
        date=current_date,
        time__hour=now.hour,
        time__minute=now.minute,
        email_notify=True,
        is_completed=False
    )
    
    if reminders.exists():
        logger.info(f"MATCH FOUND: Found {reminders.count()} reminders.")

    for r in reminders:
        try:
            # Fallback to username if email field is empty in auth_user
            recipient = r.user.email or r.user.username
            
            send_mail(
                subject=f"⏰ Investo Reminder: {r.title}",
                message=f"Hi {r.user.first_name or r.user.username},\n\nIt's time for: {r.title}\n{r.description}\n\nBest, Investo Team",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            
            r.is_completed = True 
            r.save()
            logger.info(f"SUCCESS: Email sent to {recipient}")
        except Exception as e:
            logger.error(f"MAIL ERROR: {e}")