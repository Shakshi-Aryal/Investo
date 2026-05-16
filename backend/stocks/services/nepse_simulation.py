"""
NEPSE-realistic market simulation.

Constraints:
- Tick move: ~0.05%–0.5% per tick (configurable cap)
- Daily circuit: ±10% from session open
- Sector-typical price bands (NPR)
- No trading on Sat/Sun; live ticks only during 11:00–15:00 NPT
"""
import logging
import random
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

from .nepse_calendar import is_trading_session, now_nepal

logger = logging.getLogger(__name__)

# Per-tick absolute return cap (0.5%)
MAX_TICK_PCT = 0.005
# Typical tick magnitude (0.05%–0.35%)
TICK_SIGMA = 0.0018

# NEPSE daily circuit breaker
DAILY_CIRCUIT_PCT = 0.10

# Display clamp for DB percentage_change field sanity
MAX_DISPLAY_PCT = Decimal('10.00')
MIN_DISPLAY_PCT = Decimal('-10.00')

SECTOR_BOUNDS = {
    'commercial_bank': (150, 500),
    'development_bank': (150, 500),
    'finance': (100, 400),
    'insurance': (400, 4000),
    'hydropower': (200, 900),
    'manufacturing': (800, 4000),
    'microfinance': (400, 1500),
    'hotel_tourism': (200, 600),
    'trading': (200, 600),
    'others': (100, 500),
}

# Realistic NEPSE index level (not derived from raw market cap)
NEPSE_INDEX_BASE = 2650.0


def _round2(value):
    return float(Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


def clamp_price_to_sector(price, sector):
    lo, hi = SECTOR_BOUNDS.get(sector, SECTOR_BOUNDS['others'])
    return _round2(max(lo, min(hi, price)))


def clamp_daily_circuit(price, day_open):
    floor = day_open * (1 - DAILY_CIRCUIT_PCT)
    ceiling = day_open * (1 + DAILY_CIRCUIT_PCT)
    return _round2(max(floor, min(ceiling, price)))


def clamp_tick_return():
    """Small fractional tick; Gaussian clipped to ±MAX_TICK_PCT."""
    move = random.gauss(0, TICK_SIGMA)
    return max(-MAX_TICK_PCT, min(MAX_TICK_PCT, move))


def clamp_percentage_change(pct):
    pct = Decimal(str(pct))
    if pct > MAX_DISPLAY_PCT:
        return MAX_DISPLAY_PCT
    if pct < MIN_DISPLAY_PCT:
        return MIN_DISPLAY_PCT
    return pct.quantize(Decimal('0.01'))


class SimulationEngine:
    """Per-symbol state with NEPSE circuit and session awareness."""

    def __init__(self):
        self._states = {}

    def _reset_session(self, state, price, day_key):
        state['day_key'] = day_key
        state['day_open'] = price
        state['day_high'] = price
        state['day_low'] = price

    def _get_state(self, symbol, current_price, sector='others'):
        price = clamp_price_to_sector(max(float(current_price), 1.0), sector)
        day_key = now_nepal().date().isoformat()

        if symbol not in self._states:
            self._states[symbol] = {
                'sector': sector,
                'day_key': day_key,
                'day_open': price,
                'day_high': price,
                'day_low': price,
                'last_price': price,
            }
        else:
            state = self._states[symbol]
            state['sector'] = sector
            if state.get('day_key') != day_key:
                self._reset_session(state, price, day_key)
            state['last_price'] = price

        return self._states[symbol]

    def simulate_price_tick(
        self,
        current_price,
        symbol='UNKNOWN',
        volume_base=5000,
        sector='others',
        force_static=False,
    ):
        """
        One simulation step. When market is closed or force_static, price unchanged.
        """
        price = clamp_price_to_sector(max(float(current_price), 1.0), sector)

        if force_static or not is_trading_session():
            return {
                'new_price': price,
                'volume': 0,
                'high': price,
                'low': price,
                'static': True,
            }

        state = self._get_state(symbol, price, sector)
        day_key = now_nepal().date().isoformat()
        if state['day_key'] != day_key:
            self._reset_session(state, price, day_key)

        tick_pct = clamp_tick_return()
        raw = price * (1 + tick_pct)
        raw = clamp_daily_circuit(raw, state['day_open'])
        new_price = clamp_price_to_sector(raw, sector)

        state['last_price'] = new_price
        state['day_high'] = max(state['day_high'], new_price)
        state['day_low'] = min(state['day_low'], new_price)

        # Modest volume per tick (Lakhs/Crores scale over session)
        volume = int(volume_base * random.uniform(0.4, 1.2))
        if random.random() < 0.08:
            volume = int(volume * random.uniform(1.5, 2.5))

        return {
            'new_price': new_price,
            'volume': max(volume, 1),
            'high': _round2(max(price, new_price)),
            'low': _round2(min(price, new_price)),
            'static': False,
        }


def generate_historical_candles(base_price, days=180, symbol='UNKNOWN', sector='others'):
    """Generate daily OHLC on weekdays only, each day within ±10% circuit."""
    candles = []
    price = clamp_price_to_sector(float(base_price), sector)
    start = now_nepal() - timedelta(days=days)

    for i in range(days):
        day_date = (start + timedelta(days=i)).replace(hour=12, minute=0, second=0, microsecond=0)
        if day_date.weekday() >= 5:
            continue

        day_open = price
        day_high = day_open
        day_low = day_open
        day_volume = 0

        # ~20 intraday steps per historical day
        for _ in range(20):
            tick_pct = clamp_tick_return()
            price = day_open * (1 + tick_pct)
            price = clamp_daily_circuit(price, day_open)
            price = clamp_price_to_sector(price, sector)
            day_high = max(day_high, price)
            day_low = min(day_low, price)
            day_volume += random.randint(800, 4000)

        close_price = price
        day_high = max(day_high, day_open, close_price)
        day_low = min(day_low, day_open, close_price)
        day_low = max(day_low, 0.5)

        candles.append({
            'date': day_date,
            'open': _round2(day_open),
            'high': _round2(day_high),
            'low': _round2(day_low),
            'close': _round2(close_price),
            'volume': day_volume,
        })

    return candles


def compute_nepse_index(stocks):
    """
    Index near real NEPSE levels (~2,600–2,800), driven by average capped % change.
    """
    if not stocks:
        return {
            'index_value': Decimal(str(NEPSE_INDEX_BASE)),
            'change': Decimal('0'),
            'percentage_change': Decimal('0'),
            'high': Decimal(str(NEPSE_INDEX_BASE)),
            'low': Decimal(str(NEPSE_INDEX_BASE)),
            'total_turnover': Decimal('0'),
            'total_volume': 0,
            'total_trades': 0,
            'advancing': 0,
            'declining': 0,
            'unchanged': 0,
        }

    pcts = [float(clamp_percentage_change(s.percentage_change)) for s in stocks]
    avg_pct = sum(pcts) / len(pcts)
    index_value = _round2(NEPSE_INDEX_BASE * (1 + avg_pct / 100))
    prev_index = _round2(NEPSE_INDEX_BASE)
    change = _round2(index_value - prev_index)
    pct_change = clamp_percentage_change(avg_pct)

    total_volume = sum(int(s.volume) for s in stocks)
    advancing = sum(1 for p in pcts if p > 0)
    declining = sum(1 for p in pcts if p < 0)
    unchanged = len(pcts) - advancing - declining

    # Turnover in NPR (sum of price * volume approx) — stored raw; format on frontend
    turnover = sum(float(s.current_price) * int(s.volume) for s in stocks)

    return {
        'index_value': Decimal(str(index_value)),
        'change': Decimal(str(change)),
        'percentage_change': pct_change,
        'high': Decimal(str(_round2(index_value * 1.002))),
        'low': Decimal(str(_round2(index_value * 0.998))),
        'total_turnover': Decimal(str(_round2(turnover))),
        'total_volume': total_volume,
        'total_trades': max(total_volume // 200, 0),
        'advancing': advancing,
        'declining': declining,
        'unchanged': unchanged,
    }
