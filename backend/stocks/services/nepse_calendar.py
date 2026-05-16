"""
NEPSE trading calendar — Asia/Kathmandu.
Monday–Friday, 11:00–15:00 (market closed Saturday & Sunday).
"""
from datetime import datetime, time
from zoneinfo import ZoneInfo

NEPAL_TZ = ZoneInfo('Asia/Kathmandu')
SESSION_OPEN = time(11, 0)
SESSION_CLOSE = time(15, 0)


def now_nepal():
    """Current naive datetime in Nepal (for DB fields without tz)."""
    return datetime.now(NEPAL_TZ).replace(tzinfo=None)


def is_trading_day(dt=None):
    """True on Monday–Friday in Nepal."""
    if dt is None:
        dt = datetime.now(NEPAL_TZ)
    elif dt.tzinfo is None:
        dt = dt.replace(tzinfo=NEPAL_TZ)
    else:
        dt = dt.astimezone(NEPAL_TZ)
    return dt.weekday() < 5  # Mon=0 … Fri=4


def is_trading_session(dt=None):
    """True during NEPSE regular session hours on a trading day."""
    if dt is None:
        dt = datetime.now(NEPAL_TZ)
    elif dt.tzinfo is None:
        dt = dt.replace(tzinfo=NEPAL_TZ)
    else:
        dt = dt.astimezone(NEPAL_TZ)

    if not is_trading_day(dt):
        return False

    t = dt.time()
    return SESSION_OPEN <= t < SESSION_CLOSE


def is_market_open(settings_mode=None):
    """
    Respects Django MARKET_SIMULATION_MODE:
    - always_open: legacy 24/7 (dev only)
    - nepse_hours: Mon–Fri 11:00–15:00 NPT
    """
    from django.conf import settings

    mode = settings_mode or getattr(settings, 'MARKET_SIMULATION_MODE', 'nepse_hours')
    if mode == 'always_open':
        return True
    return is_trading_session()
