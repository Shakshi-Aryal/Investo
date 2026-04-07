import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investo_backend.settings')

app = Celery('investo_backend')

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'send-reminder-emails-every-minute': {
        'task': 'reminders.tasks.send_reminder_emails', # Points to reminders/tasks.py
        'schedule': crontab(minute='*'),
    },
}