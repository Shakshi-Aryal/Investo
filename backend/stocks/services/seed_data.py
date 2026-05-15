"""
Seed data generator for Investo stock market.

Creates 20 NEPSE-style fictional stocks across multiple sectors
and generates 6 months of historical candlestick data.
"""
from datetime import datetime, timedelta
from decimal import Decimal
import logging
from stocks.models import Stock, CandleData, MarketIndex
from stocks.services.simulation_engine import generate_historical_candles

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# 20 Fictional NEPSE-style stocks
# ──────────────────────────────────────────────
STOCK_DEFINITIONS = [
    # Commercial Banks
    {'symbol': 'NABIL', 'company_name': 'Nabil Bank Limited', 'sector': 'commercial_bank', 'base_price': 620, 'shares': 5000000},
    {'symbol': 'GBIME', 'company_name': 'Global IME Bank Limited', 'sector': 'commercial_bank', 'base_price': 290, 'shares': 8000000},
    {'symbol': 'NICA', 'company_name': 'NIC Asia Bank Limited', 'sector': 'commercial_bank', 'base_price': 410, 'shares': 6500000},
    {'symbol': 'SBL', 'company_name': 'Siddhartha Bank Limited', 'sector': 'commercial_bank', 'base_price': 320, 'shares': 7000000},
    {'symbol': 'KBL', 'company_name': 'Kumari Bank Limited', 'sector': 'commercial_bank', 'base_price': 195, 'shares': 4500000},

    # Development Banks
    {'symbol': 'MNBBL', 'company_name': 'Muktinath Bikas Bank Limited', 'sector': 'development_bank', 'base_price': 380, 'shares': 3000000},
    {'symbol': 'SADBL', 'company_name': 'Sagarmatha Development Bank Limited', 'sector': 'development_bank', 'base_price': 210, 'shares': 2500000},

    # Finance
    {'symbol': 'GUFL', 'company_name': 'Gurkhas Finance Limited', 'sector': 'finance', 'base_price': 155, 'shares': 2000000},
    {'symbol': 'ICFC', 'company_name': 'ICFC Finance Limited', 'sector': 'finance', 'base_price': 180, 'shares': 2200000},

    # Insurance
    {'symbol': 'NLIC', 'company_name': 'Nepal Life Insurance Company', 'sector': 'insurance', 'base_price': 520, 'shares': 4000000},
    {'symbol': 'SICL', 'company_name': 'Shikhar Insurance Company Ltd', 'sector': 'insurance', 'base_price': 440, 'shares': 3500000},

    # Hydropower
    {'symbol': 'NHPC', 'company_name': 'National Hydropower Company', 'sector': 'hydropower', 'base_price': 78, 'shares': 10000000},
    {'symbol': 'BPCL', 'company_name': 'Butwal Power Company Limited', 'sector': 'hydropower', 'base_price': 350, 'shares': 5500000},
    {'symbol': 'AKPL', 'company_name': 'Arun Kabeli Power Limited', 'sector': 'hydropower', 'base_price': 135, 'shares': 3000000},

    # Manufacturing
    {'symbol': 'UNL', 'company_name': 'Unilever Nepal Limited', 'sector': 'manufacturing', 'base_price': 8500, 'shares': 500000},
    {'symbol': 'BNT', 'company_name': 'Bottlers Nepal (Terai) Ltd', 'sector': 'manufacturing', 'base_price': 1200, 'shares': 1000000},

    # Microfinance
    {'symbol': 'CBBL', 'company_name': 'Chhimek Laghubitta Bikas Bank', 'sector': 'microfinance', 'base_price': 1050, 'shares': 1500000},
    {'symbol': 'NMBMF', 'company_name': 'NMB Microfinance Bittiya Sanstha', 'sector': 'microfinance', 'base_price': 780, 'shares': 1200000},

    # Hotel & Tourism
    {'symbol': 'TRH', 'company_name': 'Taragaon Regency Hotels', 'sector': 'hotel_tourism', 'base_price': 260, 'shares': 4000000},

    # Trading
    {'symbol': 'STC', 'company_name': 'Salt Trading Corporation', 'sector': 'trading', 'base_price': 420, 'shares': 3000000},
]


def seed_stocks():
    """Create or update all stock entries in the database."""
    created_count = 0
    updated_count = 0

    for stock_def in STOCK_DEFINITIONS:
        stock, created = Stock.objects.update_or_create(
            symbol=stock_def['symbol'],
            defaults={
                'company_name': stock_def['company_name'],
                'sector': stock_def['sector'],
                'current_price': Decimal(str(stock_def['base_price'])),
                'open_price': Decimal(str(stock_def['base_price'])),
                'close_price': Decimal(str(stock_def['base_price'])),
                'previous_close': Decimal(str(stock_def['base_price'])),
                'high_price': Decimal(str(stock_def['base_price'] * 1.02)),
                'low_price': Decimal(str(stock_def['base_price'] * 0.98)),
                'volume': 0,
                'total_listed_shares': stock_def['shares'],
                'market_cap': Decimal(str(stock_def['base_price'] * stock_def['shares'])),
                'is_active': True,
            }
        )
        if created:
            created_count += 1
        else:
            updated_count += 1

    logger.info(f"[SEED] Stocks: {created_count} created, {updated_count} updated")
    return created_count, updated_count


def seed_historical_candles(days=180):
    """Generate historical OHLC candle data for all stocks."""
    stocks = Stock.objects.filter(is_active=True)
    total_candles = 0

    for stock in stocks:
        # Delete existing candle data for clean seed
        CandleData.objects.filter(stock=stock, timeframe='1d').delete()

        # Generate historical candles
        candles = generate_historical_candles(
            base_price=float(stock.current_price),
            days=days,
            symbol=stock.symbol,
        )

        # Bulk create candle records
        candle_objects = []
        for candle in candles:
            candle_objects.append(CandleData(
                stock=stock,
                timestamp=candle['date'],
                timeframe='1d',
                open_price=Decimal(str(candle['open'])),
                high_price=Decimal(str(candle['high'])),
                low_price=Decimal(str(candle['low'])),
                close_price=Decimal(str(candle['close'])),
                volume=candle['volume'],
            ))

        CandleData.objects.bulk_create(candle_objects)
        total_candles += len(candle_objects)

        # Update stock's current price to the last candle's close
        if candles:
            last = candles[-1]
            stock.current_price = Decimal(str(last['close']))
            stock.close_price = Decimal(str(last['close']))
            stock.open_price = Decimal(str(last['open']))
            stock.high_price = Decimal(str(last['high']))
            stock.low_price = Decimal(str(last['low']))
            stock.volume = last['volume']
            if len(candles) >= 2:
                stock.previous_close = Decimal(str(candles[-2]['close']))
                change = stock.current_price - stock.previous_close
                stock.point_change = change
                if stock.previous_close > 0:
                    stock.percentage_change = (change / stock.previous_close) * 100
            stock.market_cap = stock.current_price * stock.total_listed_shares
            stock.save()

        logger.info(f"[SEED] {stock.symbol}: {len(candle_objects)} candles generated")

    return total_candles


def seed_market_index():
    """Create initial market index."""
    stocks = Stock.objects.filter(is_active=True)
    if not stocks.exists():
        return

    total_cap = sum(float(s.market_cap) for s in stocks)
    avg_change = sum(float(s.percentage_change) for s in stocks) / stocks.count()
    advancing = stocks.filter(percentage_change__gt=0).count()
    declining = stocks.filter(percentage_change__lt=0).count()
    unchanged = stocks.filter(percentage_change=0).count()

    # Derive index value from total market cap (scaled)
    index_value = total_cap / 1000000  # Scale down for display

    MarketIndex.objects.update_or_create(
        index_name='NEPSE',
        defaults={
            'index_value': Decimal(str(round(index_value, 2))),
            'change': Decimal(str(round(avg_change * index_value / 100, 2))),
            'percentage_change': Decimal(str(round(avg_change, 2))),
            'high': Decimal(str(round(index_value * 1.005, 2))),
            'low': Decimal(str(round(index_value * 0.995, 2))),
            'total_turnover': Decimal(str(round(total_cap * 0.001, 2))),
            'total_volume': sum(s.volume for s in stocks),
            'total_trades': sum(s.volume for s in stocks) // 100,
            'advancing': advancing,
            'declining': declining,
            'unchanged': unchanged,
            'is_market_open': True,
        }
    )
    logger.info(f"[SEED] Market index created: {round(index_value, 2)}")


def seed_intraday_candles(hours=24):
    """Generate 1-minute historical candles for active stocks."""
    stocks = Stock.objects.filter(is_active=True)
    total_candles = 0
    now = datetime.now()
    start_time = now - timedelta(hours=hours)
    
    # We will generate a candle for each minute in the range
    minutes_count = hours * 60
    
    for stock in stocks:
        # Delete existing 1m candles for this stock to avoid duplicates
        CandleData.objects.filter(stock=stock, timeframe='1m').delete()
        
        # We start with the stock's current price and simulate minor walk
        price = float(stock.current_price)
        candle_objects = []
        
        # Simple walk for seeding to avoid complex singletons
        for m in range(minutes_count):
            timestamp = start_time + timedelta(minutes=m)
            import random
            change = random.gauss(0, 0.002)
            open_p = price
            close_p = price * (1 + change)
            high_p = max(open_p, close_p) * (1 + random.uniform(0, 0.003))
            low_p = min(open_p, close_p) * (1 - random.uniform(0, 0.003))
            price = close_p
            
            candle_objects.append(CandleData(
                stock=stock,
                timestamp=timestamp,
                timeframe='1m',
                open_price=Decimal(str(round(open_p, 2))),
                high_price=Decimal(str(round(high_p, 2))),
                low_price=Decimal(str(round(low_p, 2))),
                close_price=Decimal(str(round(close_p, 2))),
                volume=random.randint(100, 2000)
            ))
            
        CandleData.objects.bulk_create(candle_objects)
        total_candles += len(candle_objects)
        
    logger.info(f"[SEED] Generated {total_candles} 1-minute candles")
    return total_candles


def run_full_seed(days=180):
    """Run the complete seeding process."""
    logger.info("=" * 60)
    logger.info("[SEED] Starting full market data seed...")
    logger.info("=" * 60)

    created, updated = seed_stocks()
    print(f"OK Stocks: {created} created, {updated} updated")

    total_candles = seed_historical_candles(days=days)
    print(f"OK Historical candles: {total_candles} total candles generated")

    intraday_candles = seed_intraday_candles(hours=24)
    print(f"OK Intraday 1-minute candles: {intraday_candles} generated")

    seed_market_index()
    print(f"OK Market index seeded")

    print(f"\nSeed complete! {Stock.objects.count()} stocks with {days}-day history and 24h 1-minute history.")

