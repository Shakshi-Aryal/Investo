/**
 * CandlestickChart.jsx
 *
 * lightweight-charts v5 API:
 *   chart.addSeries(CandlestickSeries, options)   ← pass the class, not a string
 *   chart.addSeries(LineSeries, options)
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
} from 'lightweight-charts';

const INDICATOR_COLORS = {
  sma:               '#2196F3',
  ema:               '#FF9800',
  bollinger_upper:   '#9C27B0',
  bollinger_middle:  '#E91E63',
  bollinger_lower:   '#9C27B0',
};

export default function CandlestickChart({ symbol, data, timeframe = '1d', isDarkMode, liveTick }) {
  const containerRef       = useRef(null);
  const chartRef           = useRef(null);
  const candleSeriesRef    = useRef(null);
  const lastBarRef         = useRef(null);
  const indicatorSeriesRef = useRef({});
  const destroyedRef       = useRef(false);

  const [activeIndicators, setActiveIndicators] = useState({
    sma: false, ema: false, bollinger: false,
  });
  const [indicatorLoading, setIndicatorLoading] = useState({});

  // ── Build / rebuild chart whenever data or theme changes ─────────────────
  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    destroyedRef.current = false;

    // Tear down previous instance
    if (chartRef.current) {
      try { chartRef.current.remove(); } catch (_) {}
      chartRef.current        = null;
      candleSeriesRef.current = null;
      indicatorSeriesRef.current = {};
      setActiveIndicators({ sma: false, ema: false, bollinger: false });
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDarkMode ? '#d1d4dc' : '#333',
      },
      grid: {
        vertLines: { color: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
        horzLines: { color: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: isDarkMode ? 'rgba(197,203,206,0.3)' : 'rgba(0,0,0,0.1)',
      },
      timeScale: {
        borderColor: isDarkMode ? 'rgba(197,203,206,0.3)' : 'rgba(0,0,0,0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      width:  containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 420,
    });

    // ── v5: pass the series class as first argument ──────────────────────
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:      '#26a69a',
      downColor:    '#ef5350',
      borderVisible: false,
      wickUpColor:   '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Normalise, deduplicate, sort
    const seen = new Set();
    const formattedData = data
      .map(d => ({
        time:  typeof d.time === 'number'
                 ? d.time
                 : Math.floor(new Date(d.time).getTime() / 1000),
        open:  parseFloat(d.open_price),
        high:  parseFloat(d.high_price),
        low:   parseFloat(d.low_price),
        close: parseFloat(d.close_price),
      }))
      .filter(d =>
        !isNaN(d.open) && !isNaN(d.high) && !isNaN(d.low) && !isNaN(d.close) &&
        d.high >= d.low
      )
      .sort((a, b) => a.time - b.time)
      .filter(d => { if (seen.has(d.time)) return false; seen.add(d.time); return true; });

    if (formattedData.length > 0) {
      candleSeries.setData(formattedData);
      lastBarRef.current = formattedData[formattedData.length - 1];
      chart.timeScale().fitContent();
    }

    chartRef.current     = chart;
    candleSeriesRef.current = candleSeries;

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      destroyedRef.current = true;
      ro.disconnect();
      if (chartRef.current) {
        try { chartRef.current.remove(); } catch (_) {}
        chartRef.current        = null;
        candleSeriesRef.current = null;
        indicatorSeriesRef.current = {};
      }
    };
  }, [data, isDarkMode]);

  // ── Handle real-time updates ─────────────────────────────────────────────
  useEffect(() => {
    if (!liveTick || !candleSeriesRef.current || !lastBarRef.current) return;

    const { price, volume, timestamp } = liveTick;
    const isIntraday = timeframe === '1m';

    let barTime;
    if (isIntraday) {
      // Start of the minute in seconds (Unix timestamp)
      barTime = Math.floor(timestamp / 60000) * 60;
    } else {
      // Start of the day in seconds (UTC)
      const date = new Date(timestamp);
      date.setUTCHours(0, 0, 0, 0);
      barTime = Math.floor(date.getTime() / 1000);
    }

    const lastBar = lastBarRef.current;
    let updatedBar;

    if (lastBar.time === barTime) {
      // Update the current bar
      updatedBar = {
        time: barTime,
        open: lastBar.open,
        high: Math.max(lastBar.high, price),
        low: Math.min(lastBar.low, price),
        close: price,
        volume: volume,
      };
    } else if (barTime > lastBar.time) {
      // Start a new bar
      updatedBar = {
        time: barTime,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume,
      };
    }

    if (updatedBar) {
      candleSeriesRef.current.update(updatedBar);
      lastBarRef.current = updatedBar;
    }
  }, [liveTick, timeframe]);

  // ── Indicator helpers ────────────────────────────────────────────────────
  const fetchAndAddIndicator = useCallback(async (type) => {
    if (!chartRef.current || !symbol) return;

    setIndicatorLoading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(
        `http://localhost:8000/api/market/stocks/${symbol}/indicators/?indicators=${type}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (!chartRef.current) return; // unmounted while fetching

      if (type === 'sma' && result.sma?.length) {
        const s = chartRef.current.addSeries(LineSeries, {
          color: INDICATOR_COLORS.sma, lineWidth: 2,
          title: 'SMA(20)', priceLineVisible: false, lastValueVisible: true,
        });
        s.setData(result.sma.map(d => ({ time: d.time, value: parseFloat(d.value) })));
        indicatorSeriesRef.current.sma = s;
      }

      if (type === 'ema' && result.ema?.length) {
        const s = chartRef.current.addSeries(LineSeries, {
          color: INDICATOR_COLORS.ema, lineWidth: 2,
          title: 'EMA(20)', priceLineVisible: false, lastValueVisible: true,
        });
        s.setData(result.ema.map(d => ({ time: d.time, value: parseFloat(d.value) })));
        indicatorSeriesRef.current.ema = s;
      }

      if (type === 'bollinger' && result.bollinger) {
        const { upper, middle, lower } = result.bollinger;
        if (upper?.length) {
          const uS = chartRef.current.addSeries(LineSeries, {
            color: INDICATOR_COLORS.bollinger_upper, lineWidth: 1, lineStyle: 2,
            title: 'BB Upper', priceLineVisible: false, lastValueVisible: false,
          });
          uS.setData(upper.map(d => ({ time: d.time, value: parseFloat(d.value) })));
          indicatorSeriesRef.current.bollinger_upper = uS;

          const mS = chartRef.current.addSeries(LineSeries, {
            color: INDICATOR_COLORS.bollinger_middle, lineWidth: 1,
            title: 'BB Mid', priceLineVisible: false, lastValueVisible: false,
          });
          mS.setData(middle.map(d => ({ time: d.time, value: parseFloat(d.value) })));
          indicatorSeriesRef.current.bollinger_middle = mS;

          const lS = chartRef.current.addSeries(LineSeries, {
            color: INDICATOR_COLORS.bollinger_lower, lineWidth: 1, lineStyle: 2,
            title: 'BB Lower', priceLineVisible: false, lastValueVisible: false,
          });
          lS.setData(lower.map(d => ({ time: d.time, value: parseFloat(d.value) })));
          indicatorSeriesRef.current.bollinger_lower = lS;
        }
      }

      setActiveIndicators(prev => ({ ...prev, [type]: true }));
    } catch (err) {
      console.error(`[Chart] Indicator error (${type}):`, err);
    } finally {
      setIndicatorLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [symbol]);

  const removeIndicator = useCallback((type) => {
    if (!chartRef.current) return;
    const keys = type === 'bollinger'
      ? ['bollinger_upper', 'bollinger_middle', 'bollinger_lower']
      : [type];
    keys.forEach(k => {
      if (indicatorSeriesRef.current[k]) {
        try { chartRef.current.removeSeries(indicatorSeriesRef.current[k]); } catch (_) {}
        delete indicatorSeriesRef.current[k];
      }
    });
    setActiveIndicators(prev => ({ ...prev, [type]: false }));
  }, []);

  const toggleIndicator = useCallback((type) => {
    activeIndicators[type] ? removeIndicator(type) : fetchAndAddIndicator(type);
  }, [activeIndicators, fetchAndAddIndicator, removeIndicator]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      {/* Indicator toggles */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'sma',       label: 'SMA',             color: INDICATOR_COLORS.sma },
          { key: 'ema',       label: 'EMA',             color: INDICATOR_COLORS.ema },
          { key: 'bollinger', label: 'Bollinger Bands', color: INDICATOR_COLORS.bollinger_upper },
        ].map(ind => (
          <button
            key={ind.key}
            onClick={() => toggleIndicator(ind.key)}
            disabled={!!indicatorLoading[ind.key]}
            className={`indicator-chip ${activeIndicators[ind.key] ? 'active' : ''}`}
            style={{
              borderColor: activeIndicators[ind.key] ? ind.color : undefined,
              color:       activeIndicators[ind.key] ? ind.color : undefined,
            }}
          >
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: ind.color, display: 'inline-block', flexShrink: 0,
            }} />
            {indicatorLoading[ind.key] ? 'Loading…' : ind.label}
          </button>
        ))}
      </div>

      {/* Chart canvas */}
      <div ref={containerRef} style={{ flex: 1, minHeight: '360px', width: '100%' }} />
    </div>
  );
}
