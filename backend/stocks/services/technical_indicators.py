"""
Technical Analysis Indicator Calculations.

All functions take a list of candle dicts with keys: open, high, low, close, volume
and return computed indicator values.
"""
from decimal import Decimal


def calculate_sma(candles, period=20):
    """Simple Moving Average."""
    closes = [float(c['close_price']) for c in candles]
    if len(closes) < period:
        return []

    sma_values = []
    for i in range(period - 1, len(closes)):
        window = closes[i - period + 1:i + 1]
        sma = sum(window) / period
        sma_values.append({
            'time': candles[i]['time'] if 'time' in candles[i] else i,
            'value': round(sma, 2),
        })
    return sma_values


def calculate_ema(candles, period=20):
    """Exponential Moving Average."""
    closes = [float(c['close_price']) for c in candles]
    if len(closes) < period:
        return []

    multiplier = 2 / (period + 1)
    # Initial EMA = SMA of first `period` values
    ema = sum(closes[:period]) / period
    ema_values = [{'time': candles[period - 1].get('time', period - 1), 'value': round(ema, 2)}]

    for i in range(period, len(closes)):
        ema = (closes[i] - ema) * multiplier + ema
        ema_values.append({
            'time': candles[i].get('time', i),
            'value': round(ema, 2),
        })
    return ema_values


def calculate_rsi(candles, period=14):
    """Relative Strength Index."""
    closes = [float(c['close_price']) for c in candles]
    if len(closes) < period + 1:
        return []

    deltas = [closes[i] - closes[i - 1] for i in range(1, len(closes))]

    # Initial average gain/loss
    gains = [d if d > 0 else 0 for d in deltas[:period]]
    losses = [-d if d < 0 else 0 for d in deltas[:period]]
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period

    rsi_values = []
    for i in range(period, len(deltas)):
        delta = deltas[i]
        gain = delta if delta > 0 else 0
        loss = -delta if delta < 0 else 0

        avg_gain = (avg_gain * (period - 1) + gain) / period
        avg_loss = (avg_loss * (period - 1) + loss) / period

        if avg_loss == 0:
            rsi = 100
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))

        rsi_values.append({
            'time': candles[i + 1].get('time', i + 1),
            'value': round(rsi, 2),
        })

    return rsi_values


def calculate_macd(candles, fast=12, slow=26, signal=9):
    """MACD (Moving Average Convergence Divergence)."""
    closes = [float(c['close_price']) for c in candles]
    if len(closes) < slow + signal:
        return {'macd': [], 'signal': [], 'histogram': []}

    def ema_series(data, period):
        multiplier = 2 / (period + 1)
        ema = sum(data[:period]) / period
        result = [ema]
        for val in data[period:]:
            ema = (val - ema) * multiplier + ema
            result.append(ema)
        return result

    fast_ema = ema_series(closes, fast)
    slow_ema = ema_series(closes, slow)

    # Align lengths
    offset = slow - fast
    macd_line = [fast_ema[i + offset] - slow_ema[i] for i in range(len(slow_ema))]

    signal_line = ema_series(macd_line, signal)
    signal_offset = signal - 1

    result = {'macd': [], 'signal': [], 'histogram': []}
    for i in range(len(signal_line)):
        idx = slow - 1 + signal_offset + i
        if idx >= len(candles):
            break
        time_val = candles[idx].get('time', idx)
        macd_val = macd_line[signal_offset + i]
        signal_val = signal_line[i]
        result['macd'].append({'time': time_val, 'value': round(macd_val, 2)})
        result['signal'].append({'time': time_val, 'value': round(signal_val, 2)})
        result['histogram'].append({'time': time_val, 'value': round(macd_val - signal_val, 2)})

    return result


def calculate_bollinger_bands(candles, period=20, std_dev=2):
    """Bollinger Bands (middle, upper, lower)."""
    closes = [float(c['close_price']) for c in candles]
    if len(closes) < period:
        return {'middle': [], 'upper': [], 'lower': []}

    import math
    result = {'middle': [], 'upper': [], 'lower': []}

    for i in range(period - 1, len(closes)):
        window = closes[i - period + 1:i + 1]
        sma = sum(window) / period
        variance = sum((x - sma) ** 2 for x in window) / period
        std = math.sqrt(variance)
        time_val = candles[i].get('time', i)

        result['middle'].append({'time': time_val, 'value': round(sma, 2)})
        result['upper'].append({'time': time_val, 'value': round(sma + std_dev * std, 2)})
        result['lower'].append({'time': time_val, 'value': round(sma - std_dev * std, 2)})

    return result
