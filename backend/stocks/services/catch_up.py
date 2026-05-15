"""
Catch-up simulation service for Investo.
Calculates missed ticks/candles since the last update and fills them in dynamically.
Allows the market to run 24/7 even on serverless/sleeping hosts like Render Free Tier.
"""
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo
from django.conf import settings
from django.db import transaction

logger = logging.getLogger(__name__)

def catch_up_market():
    """
    Checks the elapsed time since the last simulation tick.
    Simulates the missing minute-by-minute candles to catch up to the current time.
    """
    from stocks.models import Stock, CandleData, MarketIndex
    from stocks.tasks import is_market_open, _get_engine

    # Use a transaction-safe check
    index = MarketIndex.objects.first()
    if not index:
        return

    now = datetime.now()
    last_tick = index.timestamp

    # If the last tick was within the last 15 seconds, no catch-up needed
    if last_tick and (now - last_tick).total_seconds() < 15:
        return

    # Instantly update index timestamp to act as a lock
    index.timestamp = now
    index.save(update_fields=['timestamp'])

    if not last_tick:
        return

    elapsed_seconds = (now - last_tick).total_seconds()
    if elapsed_seconds < 60:
        return

    # Cap the catch-up at 4 hours (240 minutes) to keep response times fast
    elapsed_minutes = min(int(elapsed_seconds // 60), 240)
    if elapsed_minutes <= 0:
        return

    logger.info(f"[CATCH-UP] Simulating {elapsed_minutes} minutes of missed market activity...")

    engine = _get_engine()
    stocks = list(Stock.objects.filter(is_active=True))
    if not stocks:
        return

    mode = getattr(settings, 'MARKET_SIMULATION_MODE', 'always_open')
    start_time = now - timedelta(minutes=elapsed_minutes)

    # Simulate minute-by-minute candle data
    for m in range(elapsed_minutes):
        tick_time = start_time + timedelta(minutes=m)
        tick_time_naive = tick_time.replace(second=0, microsecond=0, tzinfo=None)

        # Check if the market is open at this historical minute
        is_open_at_tick = True
        if mode == 'nepse_hours':
            try:
                tz = ZoneInfo('Asia/Kathmandu')
                tick_localized = tick_time.replace(tzinfo=tz)
            except Exception:
                tick_localized = tick_time

            # Sunday is 6, Monday is 0, ..., Thursday is 3
            if tick_localized.weekday() not in [6, 0, 1, 2, 3] or not (11 <= tick_localized.hour < 15):
                is_open_at_tick = False

        if not is_open_at_tick:
            continue

        for stock in stocks:
            try:
                # Run a fast mock tick update
                result = engine.simulate_price_tick(
                    current_price=float(stock.current_price),
                    symbol=stock.symbol,
                    volume_base=1500,
                )
                new_price = Decimal(str(result['new_price']))

                # Update local in-memory stock models
                stock.current_price = new_price
                stock.volume += result['volume']
                if new_price > stock.high_price:
                    stock.high_price = new_price
                if stock.low_price == 0 or new_price < stock.low_price:
                    stock.low_price = new_price

                # Create 1m candle entry
                CandleData.objects.update_or_create(
                    stock=stock,
                    timestamp=tick_time_naive,
                    timeframe='1m',
                    defaults={
                        'open_price': new_price,
                        'high_price': Decimal(str(result['high'])),
                        'low_price': Decimal(str(result['low'])),
                        'close_price': new_price,
                        'volume': result['volume'],
                    }
                )
            except Exception as e:
                logger.error(f"[CATCH-UP] Failed for {stock.symbol} at {tick_time}: {e}")

    # Bulk save final values for stock listings
    for stock in stocks:
        if stock.previous_close and stock.previous_close > 0:
            stock.point_change = stock.current_price - stock.previous_close
            stock.percentage_change = (stock.point_change / stock.previous_close) * 100
        stock.market_cap = stock.current_price * stock.total_listed_shares
        stock.save(update_fields=[
            'current_price', 'volume', 'high_price', 'low_price',
            'point_change', 'percentage_change', 'market_cap', 'last_updated'
        ])

    # Recalculate and update the market index value
    total_cap = sum(float(s.market_cap) for s in stocks)
    index_value = total_cap / 1000000
    avg_change = sum(float(s.percentage_change) for s in stocks) / len(stocks)

    index.index_value = Decimal(str(round(index_value, 2)))
    index.change = Decimal(str(round(avg_change * index_value / 100, 2)))
    index.percentage_change = Decimal(str(round(avg_change, 2)))
    index.total_volume = sum(s.volume for s in stocks)
    index.save()

    logger.info("[CATCH-UP] Market simulation catch-up complete.")
