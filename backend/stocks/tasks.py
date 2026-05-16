"""
Celery tasks for stock market simulation and alert monitoring.
"""
import logging
from decimal import Decimal
from datetime import datetime
from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from stocks.services.nepse_calendar import is_market_open, now_nepal
from stocks.services.nepse_simulation import clamp_percentage_change, compute_nepse_index

logger = logging.getLogger(__name__)

_simulation_engine = None


def _get_engine():
    global _simulation_engine
    if _simulation_engine is None:
        from stocks.services.nepse_simulation import SimulationEngine
        _simulation_engine = SimulationEngine()
    return _simulation_engine


def _broadcast_index(channel_layer, index, market_open):
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
                    'total_turnover': str(index.total_turnover),
                    'is_market_open': market_open,
                },
            },
        )
    except Exception as e:
        logger.debug('WS index broadcast error: %s', e)


def _update_market_index(stocks, channel_layer, market_open):
    from stocks.models import MarketIndex

    if not stocks:
        return

    data = compute_nepse_index(stocks)
    data['is_market_open'] = market_open

    try:
        index, _ = MarketIndex.objects.update_or_create(
            index_name='NEPSE',
            defaults=data,
        )
        _broadcast_index(channel_layer, index, market_open)
    except Exception as e:
        logger.error('[INDEX] Update failed: %s', e)


@shared_task
def simulate_market_tick():
    """
    Runs every 5 seconds. Updates prices only during NEPSE session (Mon–Fri 11:00–15:00 NPT).
    """
    from stocks.models import Stock, CandleData, MarketIndex

    market_open = is_market_open()
    channel_layer = get_channel_layer()

    index = MarketIndex.objects.first()
    if index and index.is_market_open != market_open:
        index.is_market_open = market_open
        index.save(update_fields=['is_market_open'])
        _broadcast_index(channel_layer, index, market_open)

    stocks = list(Stock.objects.filter(is_active=True))
    if not stocks:
        return 'No active stocks'

    if not market_open:
        return 'Market closed — prices static'

    engine = _get_engine()
    all_updates = []
    session_day = now_nepal().date()

    for stock in stocks:
        try:
            if stock.open_price == 0 or stock.previous_close == 0:
                stock.open_price = stock.current_price
                stock.previous_close = stock.current_price

            # New session: reset daily OHLC anchors
            if stock.last_updated and stock.last_updated.date() != session_day:
                stock.previous_close = stock.current_price
                stock.open_price = stock.current_price
                stock.high_price = stock.current_price
                stock.low_price = stock.current_price
                stock.volume = 0

            result = engine.simulate_price_tick(
                current_price=float(stock.current_price),
                symbol=stock.symbol,
                volume_base=max(int(stock.volume) // 20, 200) if stock.volume else 200,
                sector=stock.sector,
            )

            new_price = Decimal(str(result['new_price']))
            stock.current_price = new_price

            if result['volume'] > 0:
                stock.volume = int(stock.volume) + result['volume']
                if new_price > stock.high_price:
                    stock.high_price = new_price
                if stock.low_price == 0 or new_price < stock.low_price:
                    stock.low_price = new_price

            if stock.previous_close and stock.previous_close > 0:
                stock.point_change = new_price - stock.previous_close
                raw_pct = (stock.point_change / stock.previous_close) * 100
                stock.percentage_change = clamp_percentage_change(raw_pct)
            else:
                stock.point_change = Decimal('0')
                stock.percentage_change = Decimal('0')

            stock.market_cap = new_price * stock.total_listed_shares
            stock.save(update_fields=[
                'current_price', 'volume', 'high_price', 'low_price',
                'open_price', 'previous_close', 'point_change', 'percentage_change',
                'market_cap', 'last_updated',
            ])

            if result['volume'] > 0:
                current_minute = now_nepal().replace(second=0, microsecond=0)
                candle_1m, created_1m = CandleData.objects.get_or_create(
                    stock=stock,
                    timestamp=current_minute,
                    timeframe='1m',
                    defaults={
                        'open_price': new_price,
                        'high_price': new_price,
                        'low_price': new_price,
                        'close_price': new_price,
                        'volume': result['volume'],
                    },
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
                'percentage_change': str(stock.percentage_change),
                'point_change': str(round(float(stock.point_change), 2)),
                'volume': stock.volume,
                'high_price': str(stock.high_price),
                'low_price': str(stock.low_price),
                'market_cap': str(stock.market_cap),
            }
            all_updates.append(update_data)

            try:
                async_to_sync(channel_layer.group_send)(
                    f'stock_{stock.symbol}',
                    {'type': 'price_update', 'data': update_data},
                )
            except Exception as e:
                logger.debug('WS broadcast error for %s: %s', stock.symbol, e)

        except Exception as e:
            logger.error('[SIM] Error simulating %s: %s', stock.symbol, e)

    try:
        async_to_sync(channel_layer.group_send)(
            'market_updates',
            {'type': 'market_update', 'data': all_updates},
        )
    except Exception as e:
        logger.debug('WS market broadcast error: %s', e)

    _update_market_index(stocks, channel_layer, market_open)
    return f'Simulated tick for {len(all_updates)} stocks'


@shared_task
def check_price_alerts():
    from stocks.models import PriceAlert

    if not is_market_open():
        return 'Market closed — alerts skipped'

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

                try:
                    from notifications.services import create_notification
                    condition_text = 'above' if alert.condition == 'above' else 'below'
                    create_notification(
                        user=alert.user,
                        notification_type='alert',
                        title=f'Price Alert: {alert.stock.symbol}',
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
                    logger.error('Failed notification for alert %s: %s', alert.id, e)
        except Exception as e:
            logger.error('[ALERT] Error checking alert %s: %s', alert.id, e)

    if triggered_count > 0:
        logger.info('[ALERTS] Triggered %s alerts', triggered_count)
    return f'Checked alerts: {triggered_count} triggered'


@shared_task
def generate_daily_candle():
    from stocks.models import Stock, CandleData

    stocks = Stock.objects.filter(is_active=True)
    now = now_nepal()
    count = 0

    for stock in stocks:
        try:
            CandleData.objects.update_or_create(
                stock=stock,
                timestamp=now.replace(hour=15, minute=0, second=0, microsecond=0),
                timeframe='1d',
                defaults={
                    'open_price': stock.open_price,
                    'high_price': stock.high_price,
                    'low_price': stock.low_price,
                    'close_price': stock.current_price,
                    'volume': stock.volume,
                },
            )

            stock.previous_close = stock.current_price
            stock.open_price = stock.current_price
            stock.high_price = stock.current_price
            stock.low_price = stock.current_price
            stock.volume = 0
            stock.point_change = Decimal('0')
            stock.percentage_change = Decimal('0')
            stock.save(update_fields=[
                'previous_close', 'open_price', 'high_price', 'low_price', 'volume',
                'point_change', 'percentage_change',
            ])
            count += 1
        except Exception as e:
            logger.error('[CANDLE] Error for %s: %s', stock.symbol, e)

    logger.info('[CANDLE] Generated daily candles for %s stocks', count)
    return f'Daily candles generated for {count} stocks'
