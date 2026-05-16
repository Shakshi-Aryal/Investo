/**
 * Professional OHLC candlestick chart (lightweight-charts v5).
 * Bullish: green (close >= open). Bearish: red (close < open).
 */
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
} from 'lightweight-charts';
import { useTheme } from '../../context/ThemeContext';
import { apiUrl } from '../../config';

const BULL_COLOR = '#22c55e';
const BEAR_COLOR = '#ef4444';

const INDICATOR_COLORS = {
  sma: '#2196F3',
  ema: '#FF9800',
  bollinger_upper: '#9C27B0',
  bollinger_middle: '#E91E63',
  bollinger_lower: '#9C27B0',
};

function normalizeCandle(d) {
  const time =
    typeof d.time === 'number'
      ? d.time
      : Math.floor(new Date(d.time || d.timestamp).getTime() / 1000);

  const open = parseFloat(d.open ?? d.open_price);
  const high = parseFloat(d.high ?? d.high_price);
  const low = parseFloat(d.low ?? d.low_price);
  const close = parseFloat(d.close ?? d.close_price);

  if ([open, high, low, close].some((v) => isNaN(v)) || high < low) return null;

  const hi = Math.max(open, close, high);
  const lo = Math.min(open, close, low);

  return { time, open, high: hi, low: lo, close };
}

function buildFallbackSeries(lastPrice, bars = 60) {
  const price = Math.max(parseFloat(lastPrice) || 100, 1);
  const now = Math.floor(Date.now() / 1000);
  const daySec = 86400;
  const out = [];
  let p = price * 0.92;

  for (let i = bars; i >= 0; i--) {
    const drift = (Math.random() - 0.48) * 0.02;
    const open = p;
    const close = Math.max(open * (1 + drift), 0.5);
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low = Math.min(open, close) * (1 - Math.random() * 0.008);
    out.push({
      time: now - i * daySec,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
    });
    p = close;
  }
  return out;
}

export default function CandlestickChart({ symbol, data, timeframe = '1d', liveTick, lastPrice }) {
  const { isDarkMode } = useTheme();
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const lastBarRef = useRef(null);
  const indicatorSeriesRef = useRef({});

  const [activeIndicators, setActiveIndicators] = useState({
    sma: false,
    ema: false,
    bollinger: false,
  });
  const [indicatorLoading, setIndicatorLoading] = useState({});
  const [tooltipInfo, setTooltipInfo] = useState(null);

  const chartData = useMemo(() => {
    if (!data?.length) {
      if (lastPrice) return buildFallbackSeries(lastPrice);
      return [];
    }
    const seen = new Set();
    return data
      .map(normalizeCandle)
      .filter(Boolean)
      .sort((a, b) => a.time - b.time)
      .filter((d) => {
        if (seen.has(d.time)) return false;
        seen.add(d.time);
        return true;
      });
  }, [data, lastPrice]);

  useEffect(() => {
    if (!containerRef.current || chartData.length === 0) return;

    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (_) {}
      chartRef.current = null;
      candleSeriesRef.current = null;
      indicatorSeriesRef.current = {};
      setActiveIndicators({ sma: false, ema: false, bollinger: false });
    }

    const el = containerRef.current;
    const height = el.clientHeight || 420;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDarkMode ? '#94a3b8' : '#475569',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: isDarkMode ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.06)' },
        horzLines: { color: isDarkMode ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.06)' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: isDarkMode ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.1)',
      },
      timeScale: {
        borderColor: isDarkMode ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.1)',
        timeVisible: true,
        secondsVisible: timeframe === '1m',
      },
      width: el.clientWidth,
      height,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: BULL_COLOR,
      downColor: BEAR_COLOR,
      borderVisible: false,
      wickUpColor: BULL_COLOR,
      wickDownColor: BEAR_COLOR,
    });

    candleSeries.setData(chartData);
    lastBarRef.current = chartData[chartData.length - 1];
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const ro = new ResizeObserver(() => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 420,
        });
      }
    });
    ro.observe(el);

    chart.subscribeCrosshairMove((param) => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0 ||
        param.point.x > el.clientWidth ||
        param.point.y > el.clientHeight
      ) {
        setTooltipInfo(null);
        return;
      }

      const bar = param.seriesData.get(candleSeries);
      if (bar) {
        const bullish = bar.close >= bar.open;
        setTooltipInfo({
          x: param.point.x,
          y: param.point.y,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          bullish,
        });
      } else {
        setTooltipInfo(null);
      }
    });

    return () => {
      ro.disconnect();
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (_) {}
        chartRef.current = null;
        candleSeriesRef.current = null;
      }
    };
  }, [chartData, isDarkMode, timeframe]);

  useEffect(() => {
    if (!liveTick || !candleSeriesRef.current || !lastBarRef.current) return;

    const { price, timestamp } = liveTick;
    const p = parseFloat(price);
    if (isNaN(p)) return;

    const isIntraday = timeframe === '1m';
    let barTime;
    if (isIntraday) {
      barTime = Math.floor(timestamp / 60000) * 60;
    } else {
      const date = new Date(timestamp);
      date.setUTCHours(0, 0, 0, 0);
      barTime = Math.floor(date.getTime() / 1000);
    }

    const lastBar = lastBarRef.current;
    let updatedBar;

    if (lastBar.time === barTime) {
      updatedBar = {
        time: barTime,
        open: lastBar.open,
        high: Math.max(lastBar.high, p),
        low: Math.min(lastBar.low, p),
        close: p,
      };
    } else if (barTime > lastBar.time) {
      updatedBar = {
        time: barTime,
        open: p,
        high: p,
        low: p,
        close: p,
      };
    }

    if (updatedBar) {
      candleSeriesRef.current.update(updatedBar);
      lastBarRef.current = updatedBar;
    }
  }, [liveTick, timeframe]);

  const fetchAndAddIndicator = useCallback(
    async (type) => {
      if (!chartRef.current || !symbol) return;
      setIndicatorLoading((prev) => ({ ...prev, [type]: true }));
      try {
        const res = await fetch(
          `${apiUrl(`/market/stocks/${symbol}/indicators/`)}?indicators=${type}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (!chartRef.current) return;

        if (type === 'sma' && result.sma?.length) {
          const s = chartRef.current.addSeries(LineSeries, {
            color: INDICATOR_COLORS.sma,
            lineWidth: 2,
            title: 'SMA(20)',
            priceLineVisible: false,
          });
          s.setData(result.sma.map((d) => ({ time: d.time, value: parseFloat(d.value) })));
          indicatorSeriesRef.current.sma = s;
        }

        if (type === 'ema' && result.ema?.length) {
          const s = chartRef.current.addSeries(LineSeries, {
            color: INDICATOR_COLORS.ema,
            lineWidth: 2,
            title: 'EMA(20)',
            priceLineVisible: false,
          });
          s.setData(result.ema.map((d) => ({ time: d.time, value: parseFloat(d.value) })));
          indicatorSeriesRef.current.ema = s;
        }

        if (type === 'bollinger' && result.bollinger) {
          const { upper, middle, lower } = result.bollinger;
          if (upper?.length) {
            const uS = chartRef.current.addSeries(LineSeries, {
              color: INDICATOR_COLORS.bollinger_upper,
              lineWidth: 1,
              lineStyle: 2,
              priceLineVisible: false,
            });
            uS.setData(upper.map((d) => ({ time: d.time, value: parseFloat(d.value) })));
            indicatorSeriesRef.current.bollinger_upper = uS;

            const mS = chartRef.current.addSeries(LineSeries, {
              color: INDICATOR_COLORS.bollinger_middle,
              lineWidth: 1,
              priceLineVisible: false,
            });
            mS.setData(middle.map((d) => ({ time: d.time, value: parseFloat(d.value) })));
            indicatorSeriesRef.current.bollinger_middle = mS;

            const lS = chartRef.current.addSeries(LineSeries, {
              color: INDICATOR_COLORS.bollinger_lower,
              lineWidth: 1,
              lineStyle: 2,
              priceLineVisible: false,
            });
            lS.setData(lower.map((d) => ({ time: d.time, value: parseFloat(d.value) })));
            indicatorSeriesRef.current.bollinger_lower = lS;
          }
        }

        setActiveIndicators((prev) => ({ ...prev, [type]: true }));
      } catch (err) {
      } finally {
        setIndicatorLoading((prev) => ({ ...prev, [type]: false }));
      }
    },
    [symbol]
  );

  const removeIndicator = useCallback((type) => {
    if (!chartRef.current) return;
    const keys =
      type === 'bollinger' ? ['bollinger_upper', 'bollinger_middle', 'bollinger_lower'] : [type];
    keys.forEach((k) => {
      if (indicatorSeriesRef.current[k]) {
        try {
          chartRef.current.removeSeries(indicatorSeriesRef.current[k]);
        } catch (_) {}
        delete indicatorSeriesRef.current[k];
      }
    });
    setActiveIndicators((prev) => ({ ...prev, [type]: false }));
  }, []);

  const toggleIndicator = useCallback(
    (type) => {
      if (activeIndicators[type]) removeIndicator(type);
      else fetchAndAddIndicator(type);
    },
    [activeIndicators, fetchAndAddIndicator, removeIndicator]
  );

  const tooltipStyle = tooltipInfo
    ? {
        left: Math.min(tooltipInfo.x + 16, (containerRef.current?.clientWidth || 400) - 200),
        top: Math.max(tooltipInfo.y - 80, 8),
      }
    : {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { key: 'sma', label: 'SMA', color: INDICATOR_COLORS.sma },
          { key: 'ema', label: 'EMA', color: INDICATOR_COLORS.ema },
          { key: 'bollinger', label: 'Bollinger', color: INDICATOR_COLORS.bollinger_upper },
        ].map((ind) => (
          <button
            key={ind.key}
            type="button"
            onClick={() => toggleIndicator(ind.key)}
            disabled={!!indicatorLoading[ind.key]}
            className={`indicator-chip ${activeIndicators[ind.key] ? 'active' : ''}`}
            style={{
              borderColor: activeIndicators[ind.key] ? ind.color : undefined,
              color: activeIndicators[ind.key] ? ind.color : undefined,
            }}
          >
            {indicatorLoading[ind.key] ? 'Loading…' : ind.label}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 360, width: '100%' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 360 }} />

        {chartData.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            Loading chart data…
          </div>
        )}

        {tooltipInfo && (
          <div
            className="ohlc-tooltip"
            style={{
              position: 'absolute',
              zIndex: 20,
              pointerEvents: 'none',
              ...tooltipStyle,
              background: isDarkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${isDarkMode ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.1)'}`,
              padding: '10px 14px',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              fontSize: 12,
              minWidth: 160,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: '1px solid var(--card-border)',
                color: 'var(--text-main)',
              }}
            >
              {symbol}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Open</span>
              <span style={{ fontWeight: 600 }}>{tooltipInfo.open.toFixed(2)}</span>
              <span style={{ color: 'var(--text-muted)' }}>High</span>
              <span style={{ fontWeight: 600, color: BULL_COLOR }}>{tooltipInfo.high.toFixed(2)}</span>
              <span style={{ color: 'var(--text-muted)' }}>Low</span>
              <span style={{ fontWeight: 600, color: BEAR_COLOR }}>{tooltipInfo.low.toFixed(2)}</span>
              <span style={{ color: 'var(--text-muted)' }}>Close</span>
              <span
                style={{
                  fontWeight: 700,
                  color: tooltipInfo.bullish ? BULL_COLOR : BEAR_COLOR,
                }}
              >
                {tooltipInfo.close.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
