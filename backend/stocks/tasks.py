"""
Celery tasks for stock market simulation and alert monitoring.
"""
import logging
from decimal import Decimal
from datetime import datetime
from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

# Module-level singleton so trend state persists across Celery task calls
# within the same worker process
_simulation_engine = None


def is_market_open():
    """Check if simulated market is currently open based on settings."""
    from django.conf import settings
    from datetime import datetime
    from zoneinfo import ZoneInfo
    
    mode = getattr(settings, 'MARKET_SIMULATION_MODE', 'always_open')
    if mode == 'always_open':
        return True
        
    if mode == 'nepse_hours':
        # NEPSE trading hours: Sun-Thu 11:00 AM - 3:00 PM Nepal Time (Asia/Kathmandu)
        try:
            tz = ZoneInfo('Asia/Kathmandu')
            now_nepal = datetime.now(tz)
        except Exception:
            now_nepal = datetime.now()
            
        # Sunday is 6, Monday is 0, ..., Thursday is 3
        if now_nepal.weekday() not in [6, 0, 1, 2, 3]:
            return False
            
        # Check time
        start_time = now_nepal.replace(hour=11, minute=0, second=0, microsecond=0)
        end_time = now_nepal.replace(hour=15, minute=0, second=0, microsecond=0)
        
        return start_time <= now_nepal < end_time
        
    return True


def _get_engine():
    """Get or create the module-level simulation engine singleton."""
    global _simulation_engine
    if _simulation_engine is None:
        from stocks.services.simulation_engine import SimulationEngine
        _simulation_engine = SimulationEngine()
    return _simulation_engine


@shared_task
def simulate_market_tick():
    """
    Runs every 5 seconds during 'market hours'.
    Updates all stock prices and broadcasts via WebSocket.
    """
    from stocks.models import Stock, CandleData, MarketIndex
    from zoneinfo import ZoneInfo

    market_open = is_market_open()
    channel_layer = get_channel_layer()

    # Get or create market index to update state
    index = MarketIndex.objects.first()
    if index and index.is_market_open != market_open:
        index.is_market_open = market_open
        index.save(update_fields=['is_market_open'])
        # Broadcast status update
        try:
            async_to_sync(channel_layer.group_send)(
                'market_updates',
                {
                    'type': 'index_update',
                    'data': {
                        'index_value': str(index.index_value),
                        'change': str(index.change),
                        'percentage_change': str(index.percentage_change),
                        'advancing': index.advancing,
                        'declining': index.declining,
                        'unchanged': index.unchanged,
                        'total_volume': index.total_volume,
                        'is_market_open': market_open,
                    },
                }
            )
        except Exception as e:
            logger.debug(f"WS index broadcast error on status change: {e}")

    if not market_open:
        return "Market is closed. Tick simulation skipped."

    engine = _get_engine()
    stocks = list(Stock.objects.filter(is_active=True))

    if not stocks:
        return "No active stocks found"

    all_updates = []

    for stock in stocks:
        try:
            result = engine.simulate_price_tick(
                current_price=float(stock.current_price),
                symbol=stock.symbol,
                volume_base=max(int(stock.volume) // 10, 5000),
            )

            new_price = Decimal(str(result['new_price']))

            # Update stock record
            stock.current_price = new_price
            stock.volume = stock.volume + result['volume']

            # Update high/low
            if new_price > stock.high_price:
                stock.high_price = new_price
            if stock.low_price == 0 or new_price < stock.low_price:
                stock.low_price = new_price

            # Calculate change from previous close
            if stock.previous_close and stock.previous_close > 0:
                stock.point_change = new_price - stock.previous_close
                stock.percentage_change = (stock.point_change / stock.previous_close) * 100

            stock.market_cap = new_price * stock.total_listed_shares
            stock.save(update_fields=[
                'current_price', 'volume', 'high_price', 'low_price',
                'point_change', 'percentage_change', 'market_cap', 'last_updated',
            ])

            # Generate/update 1-minute CandleData
            try:
                tz = ZoneInfo('Asia/Kathmandu')
                now_nepal = datetime.now(tz)
            except Exception:
                now_nepal = datetime.now()
            current_minute_naive = now_nepal.replace(second=0, microsecond=0, tzinfo=None)

            candle_1m, created_1m = CandleData.objects.get_or_create(
                stock=stock,
                timestamp=current_minute_naive,
                timeframe='1m',
                defaults={
                    'open_price': new_price,
                    'high_price': new_price,
                    'low_price': new_price,
                    'close_price': new_price,
                    'volume': result['volume'],
                }
            )
            if not created_1m:
                candle_1m.high_price = max(candle_1m.high_price, new_price)
                candle_1m.low_price = min(candle_1m.low_price, new_price)
                candle_1m.close_price = new_price
                candle_1m.volume += result['volume']
                candle_1m.save(update_fields=['high_price', 'low_price', 'close_price', 'volume'])

            update_data = {
                'symbol': stock.symbol,
                'current_price': str(stock.current_price),
                'percentage_change': str(round(float(stock.percentage_change), 2)),
                'point_change': str(round(float(stock.point_change), 2)),
                'volume': stock.volume,
                'high_price': str(stock.high_price),
                'low_price': str(stock.low_price),
                'market_cap': str(stock.market_cap),
            }
            all_updates.append(update_data)

            # Broadcast to stock-specific channel
            try:
                async_to_sync(channel_layer.group_send)(
                    f'stock_{stock.symbol}',
                    {
                        'type': 'price_update',
                        'data': update_data,
                    }
                )
            except Exception as e:
                logger.debug(f"WS broadcast error for {stock.symbol}: {e}")

        except Exception as e:
            logger.error(f"[SIM] Error simulating {stock.symbol}: {e}")

    # Broadcast all updates to market channel
    try:
        async_to_sync(channel_layer.group_send)(
            'market_updates',
            {
                'type': 'market_update',
                'data': all_updates,
            }
        )
    except Exception as e:
        logger.debug(f"WS market broadcast error: {e}")

    # Update market index
    _update_market_index(stocks, channel_layer)

    return f"Simulated tick for {len(all_updates)} stocks"


def _update_market_index(stocks, channel_layer):
    """Helper to recalculate and broadcast market index."""
    from stocks.models import MarketIndex

    if not stocks:
        return

    total_cap = sum(float(s.market_cap) for s in stocks)
    index_value = total_cap / 1000000

    advancing = sum(1 for s in stocks if s.percentage_change > 0)
    declining = sum(1 for s in stocks if s.percentage_change < 0)
    unchanged = sum(1 for s in stocks if s.percentage_change == 0)
    total_volume = sum(s.volume for s in stocks)

    avg_change = sum(float(s.percentage_change) for s in stocks) / max(len(stocks), 1)

    try:
        index, _ = MarketIndex.objects.update_or_create(
            index_name='NEPSE',
            defaults={
                'index_value': Decimal(str(round(index_value, 2))),
                'change': Decimal(str(round(avg_change * index_value / 100, 2))),
                'percentage_change': Decimal(str(round(avg_change, 2))),
                'high': Decimal(str(round(index_value * 1.005, 2))),
                'low': Decimal(str(round(index_value * 0.995, 2))),
                'total_volume': total_volume,
                'total_trades': total_volume // 100,
                'advancing': advancing,
                'declining': declining,
                'unchanged': unchanged,
                'is_market_open': True,
            }
        )

        # Broadcast index update
        try:
            async_to_sync(channel_layer.group_send)(
                'market_updates',
                {
                    'type': 'index_update',
                    'data': {
                        'index_value': str(index.index_value),
                        'change': str(index.change),
                        'percentage_change': str(index.percentage_change),
                        'advancing': advancing,
                        'declining': declining,
                        'unchanged': unchanged,
                        'total_volume': total_volume,
                        'is_market_open': True,
                    },
                }
            )
        except Exception as e:
            logger.debug(f"WS index broadcast error: {e}")

    except Exception as e:
        logger.error(f"[INDEX] Update failed: {e}")


@shared_task
def check_price_alerts():
    """
    Runs every 10 seconds.
    Checks all active price alerts against current stock prices.
    Triggers notifications when conditions are met.
    """
    from stocks.models import PriceAlert

    alerts = PriceAlert.objects.filter(
        is_active=True, is_triggered=False
    ).select_related('stock', 'user')

    triggered_count = 0
    for alert in alerts:
        try:
            if alert.check_condition(alert.stock.current_price):
                alert.is_triggered = True
                alert.triggered_at = datetime.now()
                alert.is_active = False
                alert.save(update_fields=['is_triggered', 'triggered_at', 'is_active'])
                triggered_count += 1

                # Create notification
                try:
                    from notifications.services import create_notification
                    condition_text = 'above' if alert.condition == 'above' else 'below'
                    create_notification(
                        user=alert.user,
                        notification_type='alert',
                        title=f'🔔 Price Alert: {alert.stock.symbol}',
                        message=(
                            f'{alert.stock.symbol} is now Rs.{alert.stock.current_price} '
                            f'({condition_text} your target of Rs.{alert.target_price})'
                        ),
                        metadata={
                            'stock_symbol': alert.stock.symbol,
                            'target_price': str(alert.target_price),
                            'current_price': str(alert.stock.current_price),
                            'condition': alert.condition,
                        },
                        send_email=True,
                    )
                except Exception as e:
                    logger.error(f"Failed to create notification for alert {alert.id}: {e}")
        except Exception as e:
            logger.error(f"[ALERT] Error checking alert {alert.id}: {e}")

    if triggered_count > 0:
        logger.info(f"[ALERTS] Triggered {triggered_count} alerts")
    return f"Checked alerts: {triggered_count} triggered"


@shared_task
def generate_daily_candle():
    """
    Runs once at end of simulated trading day.
    Creates daily candle records from current stock state.
    """
    from stocks.models import Stock, CandleData

    stocks = Stock.objects.filter(is_active=True)
    now = datetime.now()
    count = 0

    for stock in stocks:
        try:
            CandleData.objects.create(
                stock=stock,
                timestamp=now,
                timeframe='1d',
                open_price=stock.open_price,
                high_price=stock.high_price,
                low_price=stock.low_price,
                close_price=stock.current_price,
                volume=stock.volume,
            )

            # Reset daily values for next session
            stock.previous_close = stock.current_price
            stock.open_price = stock.current_price
            stock.high_price = stock.current_price
            stock.low_price = stock.current_price
            stock.volume = 0
            stock.save(update_fields=[
                'previous_close', 'open_price', 'high_price', 'low_price', 'volume'
            ])
            count += 1
        except Exception as e:
            logger.error(f"[CANDLE] Error generating candle for {stock.symbol}: {e}")

    logger.info(f"[CANDLE] Generated daily candles for {count} stocks")
    return f"Daily candles generated for {count} stocks"
