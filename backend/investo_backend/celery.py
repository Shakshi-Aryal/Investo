import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investo_backend.settings')

app = Celery('investo_backend')

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    # Reminder emails — every minute
    'send-reminder-emails-every-minute': {
        'task': 'reminders.tasks.send_reminder_emails',
        'schedule': crontab(minute='*'),
    },
    # Market simulation — every 5 seconds
    'simulate-market-every-5-seconds': {
        'task': 'stocks.tasks.simulate_market_tick',
        'schedule': 5.0,
    },
    # Price alert checks — every 10 seconds
    'check-alerts-every-10-seconds': {
        'task': 'stocks.tasks.check_price_alerts',
        'schedule': 10.0,
    },
    # Daily candle generation — every day at 15:00 (3 PM Nepal time, market close)
    'generate-daily-candle': {
        'task': 'stocks.tasks.generate_daily_candle',
        'schedule': crontab(hour=15, minute=0),
    },
}
