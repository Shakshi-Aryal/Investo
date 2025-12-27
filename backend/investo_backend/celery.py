import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investo_backend.settings')

app = Celery('investo_backend')

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Schedule to run reminder emails every minute
app.conf.beat_schedule = {
    'send-reminder-emails-every-minute': {
        'task': 'reminder_app.tasks.send_reminder_emails',  # replace with your app name
        'schedule': crontab(),  # every minute
    },
}
