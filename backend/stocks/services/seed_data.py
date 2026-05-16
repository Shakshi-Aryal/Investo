"""
Seed data generator for Investo stock market (NEPSE realistic version).
"""

import logging
import random
from datetime import datetime, timedelta
from decimal import Decimal

from stocks.models import Stock, CandleData, MarketIndex
from stocks.services.nepse_simulation import (
    generate_historical_candles,
    compute_nepse_index,
    clamp_percentage_change,
    NEPSE_INDEX_BASE,
)

logger = logging.getLogger(__name__)

STOCK_DEFINITIONS = [
    {'symbol': 'NABIL', 'company_name': 'Nabil Bank Limited', 'sector': 'commercial_bank', 'base_price': 485, 'shares': 12_000_000},
    {'symbol': 'GBIME', 'company_name': 'Global IME Bank Limited', 'sector': 'commercial_bank', 'base_price': 290, 'shares': 15_000_000},
    {'symbol': 'NICA', 'company_name': 'NIC Asia Bank Limited', 'sector': 'commercial_bank', 'base_price': 410, 'shares': 14_000_000},
    {'symbol': 'SBL', 'company_name': 'Siddhartha Bank Limited', 'sector': 'commercial_bank', 'base_price': 320, 'shares': 10_000_000},
    {'symbol': 'KBL', 'company_name': 'Kumari Bank Limited', 'sector': 'commercial_bank', 'base_price': 195, 'shares': 9_000_000},
    {'symbol': 'MNBBL', 'company_name': 'Muktinath Bikas Bank Limited', 'sector': 'development_bank', 'base_price': 380, 'shares': 5_000_000},
    {'symbol': 'SADBL', 'company_name': 'Sagarmatha Development Bank Limited', 'sector': 'development_bank', 'base_price': 210, 'shares': 3_000_000},
    {'symbol': 'GUFL', 'company_name': 'Gurkhas Finance Limited', 'sector': 'finance', 'base_price': 155, 'shares': 2_000_000},
    {'symbol': 'ICFC', 'company_name': 'ICFC Finance Limited', 'sector': 'finance', 'base_price': 180, 'shares': 2_500_000},
    {'symbol': 'NLIC', 'company_name': 'Nepal Life Insurance Company', 'sector': 'insurance', 'base_price': 920, 'shares': 6_000_000},
    {'symbol': 'SICL', 'company_name': 'Shikhar Insurance Company Ltd', 'sector': 'insurance', 'base_price': 440, 'shares': 5_000_000},
    {'symbol': 'NHPC', 'company_name': 'National Hydropower Company', 'sector': 'hydropower', 'base_price': 285, 'shares': 12_000_000},
    {'symbol': 'BPCL', 'company_name': 'Butwal Power Company Limited', 'sector': 'hydropower', 'base_price': 350, 'shares': 8_000_000},
    {'symbol': 'AKPL', 'company_name': 'Arun Kabeli Power Limited', 'sector': 'hydropower', 'base_price': 235, 'shares': 7_000_000},
    {'symbol': 'UNL', 'company_name': 'Unilever Nepal Limited', 'sector': 'manufacturing', 'base_price': 2450, 'shares': 300_000},
    {'symbol': 'BNT', 'company_name': 'Bottlers Nepal (Terai) Ltd', 'sector': 'manufacturing', 'base_price': 1200, 'shares': 800_000},
    {'symbol': 'CBBL', 'company_name': 'Chhimek Laghubitta Bikas Bank', 'sector': 'microfinance', 'base_price': 1050, 'shares': 1_500_000},
    {'symbol': 'NMBMF', 'company_name': 'NMB Microfinance Bittiya Sanstha', 'sector': 'microfinance', 'base_price': 780, 'shares': 1_200_000},
    {'symbol': 'TRH', 'company_name': 'Taragaon Regency Hotels', 'sector': 'hotel_tourism', 'base_price': 260, 'shares': 4_000_000},
    {'symbol': 'STC', 'company_name': 'Salt Trading Corporation', 'sector': 'trading', 'base_price': 420, 'shares': 2_000_000},
]


def seed_stocks():
    created_count = 0
    updated_count = 0

    for s in STOCK_DEFINITIONS:
        bp = Decimal(str(s['base_price']))
        stock, created = Stock.objects.update_or_create(
            symbol=s['symbol'],
            defaults={
                'company_name': s['company_name'],
                'sector': s['sector'],
                'current_price': bp,
                'open_price': bp,
                'close_price': bp,
                'previous_close': bp,
                'high_price': bp * Decimal('1.005'),
                'low_price': bp * Decimal('0.995'),
                'volume': 0,
                'total_listed_shares': s['shares'],
                'market_cap': bp * s['shares'],
                'percentage_change': Decimal('0'),
                'point_change': Decimal('0'),
                'is_active': True,
            },
        )
        created_count += 1 if created else 0
        updated_count += 1 if not created else 0

    return created_count, updated_count


def seed_historical_candles(days=180):
    stocks = Stock.objects.filter(is_active=True)
    total = 0

    for stock in stocks:
        CandleData.objects.filter(stock=stock, timeframe='1d').delete()

        candles = generate_historical_candles(
            base_price=float(stock.current_price),
            days=days,
            symbol=stock.symbol,
            sector=stock.sector,
        )

        objs = [
            CandleData(
                stock=stock,
                timestamp=c['date'],
                timeframe='1d',
                open_price=Decimal(str(c['open'])),
                high_price=Decimal(str(c['high'])),
                low_price=Decimal(str(c['low'])),
                close_price=Decimal(str(c['close'])),
                volume=c['volume'],
            )
            for c in candles
        ]

        CandleData.objects.bulk_create(objs)
        total += len(objs)

        if not candles:
            continue

        last = candles[-1]
        stock.current_price = Decimal(str(last['close']))
        stock.close_price = Decimal(str(last['close']))
        stock.open_price = Decimal(str(last['open']))
        stock.high_price = Decimal(str(last['high']))
        stock.low_price = Decimal(str(last['low']))
        stock.previous_close = Decimal(str(candles[-2]['close'])) if len(candles) > 1 else stock.current_price
        stock.volume = last['volume']
        if stock.previous_close > 0:
            stock.point_change = stock.current_price - stock.previous_close
            stock.percentage_change = clamp_percentage_change(
                (stock.point_change / stock.previous_close) * 100
            )
        stock.market_cap = stock.current_price * stock.total_listed_shares
        stock.save()

    return total


def seed_intraday_candles(hours=24):
    """Generate 1-minute candles for the last N hours (weekday session only)."""
    from stocks.services.nepse_calendar import is_trading_session
    from stocks.services.nepse_simulation import SimulationEngine

    stocks = Stock.objects.filter(is_active=True)
    total = 0
    engine = SimulationEngine()
    now = datetime.now()

    for stock in stocks:
        CandleData.objects.filter(stock=stock, timeframe='1m').delete()
        price = float(stock.current_price)
        objs = []

        for m in range(hours * 60):
            tick_time = now - timedelta(minutes=hours * 60 - m)
            tick_time = tick_time.replace(second=0, microsecond=0)
            if tick_time.weekday() >= 5:
                continue
            if not is_trading_session(tick_time):
                continue

            result = engine.simulate_price_tick(
                price,
                symbol=stock.symbol,
                volume_base=500,
                sector=stock.sector,
            )
            price = result['new_price']
            objs.append(CandleData(
                stock=stock,
                timestamp=tick_time,
                timeframe='1m',
                open_price=Decimal(str(result['low'])),
                high_price=Decimal(str(result['high'])),
                low_price=Decimal(str(result['low'])),
                close_price=Decimal(str(result['new_price'])),
                volume=result['volume'],
            ))

        if objs:
            CandleData.objects.bulk_create(objs[-500:])  # cap bulk size
            total += len(objs[-500:])

    return total


def seed_market_index():
    from stocks.services.nepse_calendar import is_market_open

    stocks = list(Stock.objects.filter(is_active=True))
    data = compute_nepse_index(stocks)
    data['is_market_open'] = is_market_open()

    MarketIndex.objects.update_or_create(
        index_name='NEPSE',
        defaults=data,
    )


def run_full_seed(days=180):
    created, updated = seed_stocks()
    total_candles = seed_historical_candles(days)
    intraday = seed_intraday_candles(hours=6)
    seed_market_index()
    return {
        'stocks_created': created,
        'stocks_updated': updated,
        'daily_candles': total_candles,
        'intraday_candles': intraday,
        'index_base': NEPSE_INDEX_BASE,
    }
