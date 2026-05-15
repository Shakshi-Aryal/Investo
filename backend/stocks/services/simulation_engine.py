"""
Stock Market Simulation Engine for Investo.

Generates realistic market behavior including:
- Small random fluctuations
- Bullish/bearish trends
- Volatility spikes
- Volume variation
- Valid OHLC candle relationships
"""
import random
import math
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class SimulationEngine:
    """Core engine that simulates realistic stock market movement."""

    # Market behavior parameters
    BASE_VOLATILITY = 0.008       # ~0.8% base volatility per tick
    TREND_STRENGTH = 0.002        # Trend drift per tick
    SPIKE_PROBABILITY = 0.05      # 5% chance of volatility spike
    SPIKE_MULTIPLIER = 3.0        # Spike magnitude
    MEAN_REVERSION_STRENGTH = 0.1 # Pull back toward fair value
    VOLUME_VOLATILITY = 0.3       # Volume variation

    def __init__(self):
        # Each stock gets its own trend state
        self._trends = {}

    def _get_trend(self, symbol):
        """Get or initialize trend state for a stock."""
        if symbol not in self._trends:
            self._trends[symbol] = {
                'direction': random.choice([-1, 0, 1]),  # bearish, neutral, bullish
                'momentum': random.uniform(-0.005, 0.005),
                'ticks_remaining': random.randint(20, 100),
                'fair_value_offset': 0,
            }
        return self._trends[symbol]

    def _update_trend(self, symbol):
        """Periodically shift trends to simulate market cycles."""
        trend = self._get_trend(symbol)
        trend['ticks_remaining'] -= 1
        if trend['ticks_remaining'] <= 0:
            # Shift to a new trend
            trend['direction'] = random.choices([-1, 0, 1], weights=[0.3, 0.4, 0.3])[0]
            trend['momentum'] = trend['direction'] * random.uniform(0.001, 0.005)
            trend['ticks_remaining'] = random.randint(20, 100)
            logger.debug(f"[SIM] {symbol} trend shifted: dir={trend['direction']}")

    def simulate_price_tick(self, current_price, symbol='UNKNOWN', volume_base=50000):
        """
        Generate the next price tick for a stock.

        Returns:
            dict with keys: new_price, volume, high, low
        """
        price = float(current_price)
        if price <= 0:
            price = 100.0

        trend = self._get_trend(symbol)
        self._update_trend(symbol)

        # 1. Base random walk (Gaussian noise)
        noise = random.gauss(0, self.BASE_VOLATILITY)

        # 2. Trend drift
        drift = trend['momentum']

        # 3. Volatility spike (occasional)
        if random.random() < self.SPIKE_PROBABILITY:
            spike = random.gauss(0, self.BASE_VOLATILITY * self.SPIKE_MULTIPLIER)
            noise += spike

        # 4. Mean reversion (prevent extreme runaway)
        if abs(trend.get('fair_value_offset', 0)) > 0.15:
            reversion = -trend['fair_value_offset'] * self.MEAN_REVERSION_STRENGTH * 0.01
            noise += reversion

        # Calculate percentage change and new price
        pct_change = noise + drift
        new_price = price * (1 + pct_change)

        # Keep track of fair value offset
        trend['fair_value_offset'] = trend.get('fair_value_offset', 0) + pct_change

        # Ensure price stays positive and reasonable
        new_price = max(new_price, price * 0.9)   # Max 10% drop per tick
        new_price = max(new_price, 1.0)            # Absolute floor

        # Generate intra-tick high/low
        tick_volatility = abs(pct_change) + random.uniform(0.001, 0.005)
        tick_high = max(price, new_price) * (1 + random.uniform(0, tick_volatility))
        tick_low = min(price, new_price) * (1 - random.uniform(0, tick_volatility))

        # Volume simulation (higher volume during spikes and trends)
        volume_multiplier = 1.0
        if abs(pct_change) > self.BASE_VOLATILITY * 2:
            volume_multiplier = random.uniform(1.5, 3.0)
        if trend['direction'] != 0:
            volume_multiplier *= random.uniform(1.1, 1.5)

        volume = int(volume_base * volume_multiplier * random.uniform(0.7, 1.3))

        return {
            'new_price': round(new_price, 2),
            'volume': volume,
            'high': round(tick_high, 2),
            'low': round(tick_low, 2),
        }


def generate_historical_candles(base_price, days=180, symbol='UNKNOWN'):
    """
    Generate `days` worth of realistic daily OHLC candle data.

    Returns list of dicts:
        [{'date': datetime, 'open': float, 'high': float, 'low': float, 'close': float, 'volume': int}, ...]
    """
    engine = SimulationEngine()
    candles = []
    price = float(base_price)

    # Start date: `days` ago from now
    start_date = datetime.now() - timedelta(days=days)

    for i in range(days):
        day_date = start_date + timedelta(days=i)

        # Skip weekends (NEPSE is closed Sat/Sun) — actually NEPSE is closed Sat only,
        # but we'll skip both for simplicity
        if day_date.weekday() >= 5:
            continue

        open_price = price

        # Simulate multiple intra-day ticks to build the candle
        day_high = open_price
        day_low = open_price
        day_volume = 0

        num_ticks = random.randint(15, 40)  # Intra-day granularity
        for _ in range(num_ticks):
            result = engine.simulate_price_tick(price, symbol=symbol, volume_base=10000)
            price = result['new_price']
            day_high = max(day_high, result['high'], price)
            day_low = min(day_low, result['low'], price)
            day_volume += result['volume']

        close_price = price

        # Ensure valid OHLC relationships
        day_high = max(day_high, open_price, close_price)
        day_low = min(day_low, open_price, close_price)
        day_low = max(day_low, 1.0)

        candles.append({
            'date': day_date,
            'open': round(open_price, 2),
            'high': round(day_high, 2),
            'low': round(day_low, 2),
            'close': round(close_price, 2),
            'volume': day_volume,
        })

    return candles
