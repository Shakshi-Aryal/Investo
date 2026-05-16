import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe,
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  ArrowRight,
  Radio,
} from 'lucide-react';
import {
  PRECIOUS_METALS,
  FX_RATES_NPR,
  GLOBAL_MARKET_NEWS,
  NEPAL_ECONOMIC_NEWS,
  formatNpr,
} from '../../data/economicFeed';

const portalCss = `
  .live-portal {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .metals-hero {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    padding: 0;
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(15, 23, 42, 0.4) 45%, rgba(148, 163, 184, 0.08) 100%);
    border: 1px solid var(--card-border);
  }

  .metals-ticker-track {
    display: flex;
    align-items: stretch;
    animation: metalScroll 32s linear infinite;
    width: max-content;
  }

  .metals-ticker-track:hover {
    animation-play-state: paused;
  }

  @keyframes metalScroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .metal-ticker-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 40px;
    border-right: 1px solid var(--card-border);
    min-width: 320px;
    flex-shrink: 0;
  }

  .metal-price-display {
    font-family: var(--font-heading);
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .metal-gold { color: #eab308; text-shadow: 0 0 40px rgba(234, 179, 8, 0.25); }
  .metal-silver { color: #94a3b8; text-shadow: 0 0 30px rgba(148, 163, 184, 0.2); }

  .fx-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .fx-card {
    background: var(--input-bg);
    border: 1px solid var(--card-border);
    border-radius: 14px;
    padding: 14px 16px;
    transition: border-color 0.2s, transform 0.2s;
  }

  .fx-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
  }

  .fx-code {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 15px;
  }

  .fx-rate {
    font-size: 18px;
    font-weight: 700;
    font-family: var(--font-heading);
    margin: 6px 0 2px;
  }

  .dual-feed {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .dual-feed { grid-template-columns: 1fr; }
  }

  .feed-panel {
    background: var(--input-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 380px;
  }

  .feed-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--card-border);
  }

  .feed-panel-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-family: var(--font-heading);
    font-size: 17px;
    font-weight: 700;
  }

  .feed-live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success-color);
    box-shadow: 0 0 8px var(--success-color);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .news-row {
    padding: 14px;
    border-radius: 12px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .news-row:hover {
    background: var(--card-bg);
    border-color: var(--card-border);
  }

  .news-row-title {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.4;
    color: var(--text-main);
  }

  .news-row-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    font-size: 11px;
    color: var(--text-muted);
  }

  .trend-pill {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 999px;
  }

  .trend-bullish { background: rgba(34, 197, 94, 0.12); color: var(--success-color); }
  .trend-bearish { background: rgba(239, 68, 68, 0.12); color: var(--danger-color); }
  .trend-neutral { background: var(--accent-dim); color: var(--text-muted); }
`;

function TrendIcon({ up, size = 14 }) {
  return up ? <TrendingUp size={size} /> : <TrendingDown size={size} />;
}

function MetalTickerItems({ metals, liveMetals }) {
  const items = [
    { ...metals.gold, live: liveMetals.gold, className: 'metal-gold' },
    { ...metals.silver, live: liveMetals.silver, className: 'metal-silver' },
    { ...metals.goldTejabi, live: liveMetals.goldTejabi, className: 'metal-gold' },
  ];

  const doubled = [...items, ...items];

  return (
    <div className="metals-ticker-track">
      {doubled.map((m, i) => (
        <div key={`${m.id}-${i}`} className="metal-ticker-item">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: m.className === 'metal-gold' ? 'rgba(234,179,8,0.15)' : 'rgba(148,163,184,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 13,
              color: m.className === 'metal-gold' ? '#eab308' : '#94a3b8',
            }}
          >
            {m.symbol}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              {m.label}
            </div>
            <div className={`metal-price-display ${m.className}`}>
              {formatNpr(m.live.pricePerTola)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {m.unit}
              <span
                style={{
                  marginLeft: 10,
                  color: m.live.up ? 'var(--success-color)' : 'var(--danger-color)',
                  fontWeight: 700,
                }}
              >
                {m.live.up ? '+' : ''}{m.live.changePct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NewsFeedPanel({ title, icon: Icon, accent, articles, onViewAll }) {
  return (
    <div className="feed-panel">
      <div className="feed-panel-header">
        <h3 className="feed-panel-title">
          <Icon size={20} color={accent} />
          {title}
          <span className="feed-live-dot" title="Live feed" />
        </h3>
        <span className="micro-badge micro-badge-accent">{articles.length} stories</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {articles.map((item) => (
          <article key={item.id} className="news-row">
            <p className="news-row-meta">
              <span style={{ fontWeight: 700, color: accent }}>{item.source}</span>
              <span>·</span>
              <span>{item.category}</span>
              <span>·</span>
              <span>{item.time}</span>
              <span className={`trend-pill trend-${item.trend}`}>{item.trend}</span>
            </p>
            <h4 className="news-row-title">{item.title}</h4>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {item.summary}
            </p>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        style={{
          marginTop: 8,
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid var(--card-border)',
          background: 'transparent',
          color: 'var(--text-main)',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        View full portal <ArrowRight size={14} />
      </button>
    </div>
  );
}

export default function LiveEconomicNewsPortal() {
  const navigate = useNavigate();
  const [liveMetals, setLiveMetals] = useState(PRECIOUS_METALS);
  const [liveFx, setLiveFx] = useState(FX_RATES_NPR);

  // Subtle live jitter around seeded reference prices (simulated tick)
  useEffect(() => {
    const jitterMetal = (base) => {
      const pct = (Math.random() - 0.5) * 0.12;
      const changePct = base.changePct + pct;
      return {
        ...base,
        pricePerTola: Math.round(base.pricePerTola * (1 + pct / 100)),
        changePct: +changePct.toFixed(2),
        up: changePct >= 0,
      };
    };

    const tick = () => {
      setLiveMetals({
        gold: jitterMetal(PRECIOUS_METALS.gold),
        goldTejabi: jitterMetal(PRECIOUS_METALS.goldTejabi),
        silver: jitterMetal(PRECIOUS_METALS.silver),
      });

      setLiveFx(
        FX_RATES_NPR.map((r) => {
          const j = (Math.random() - 0.5) * 0.05;
          const decimals = r.code === 'INR' ? 3 : 2;
          const buy = +(r.buy * (1 + j / 100)).toFixed(decimals);
          const sell = +(r.sell * (1 + j / 100)).toFixed(decimals);
          const changePct = +(r.changePct + (Math.random() - 0.5) * 0.05).toFixed(2);
          return { ...r, buy, sell, changePct, up: changePct >= 0 };
        })
      );
    };

    const id = setInterval(tick, 8000);
    return () => clearInterval(id);
  }, []);

  const metalsSnapshot = useMemo(
    () => [liveMetals.gold, liveMetals.silver],
    [liveMetals]
  );

  return (
    <>
      <style>{portalCss}</style>
      <div className="live-portal">
        {/* Header strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Radio size={16} color="var(--accent)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: 0.5 }}>
                GLOBAL & DOMESTIC ECONOMIC FEED
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)', maxWidth: 520 }}>
              NPR exchange rates, bullion spot prices, and dual market news feeds — updated continuously.
            </p>
          </div>
          <button
            type="button"
            className="inv-btn-primary"
            style={{ width: 'auto', padding: '10px 20px', fontSize: 13, borderRadius: 12 }}
            onClick={() => navigate('/news')}
          >
            <Sparkles size={16} /> Open Economic Feed Portal
          </button>
        </div>

        {/* Gold & Silver hero ticker */}
        <motion.div
          className="metals-hero glass-strong"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: '1px solid var(--card-border)',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="feed-live-dot" /> Bullion Spot — Kathmandu Reference
            </span>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              {metalsSnapshot.map((m) => (
                <span key={m.id} style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {m.label.split(' ')[0]}: {formatNpr(m.pricePerTola)}
                </span>
              ))}
            </div>
          </div>
          <MetalTickerItems metals={PRECIOUS_METALS} liveMetals={liveMetals} />
        </motion.div>

        {/* FX grid */}
        <motion.div
          className="glass-strong"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{ padding: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <DollarSign size={20} color="var(--accent)" />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700 }}>
              Live FX — NPR Conversion
            </h3>
            <span className="micro-badge micro-badge-accent">NRB reference · Buy / Sell</span>
          </div>
          <div className="fx-grid">
            {liveFx.map((fx) => (
              <div key={fx.code} className="fx-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="fx-code">
                    {fx.flag} {fx.code}
                  </span>
                  <span
                    className={`micro-badge ${fx.up ? 'micro-badge-success' : 'micro-badge-danger'}`}
                    style={{ fontSize: 10, padding: '2px 6px' }}
                  >
                    <TrendIcon up={fx.up} size={10} />
                    {fx.up ? '+' : ''}{fx.changePct}%
                  </span>
                </div>
                <div className="fx-rate">
                  {fx.perUnit
                    ? `${fx.buy.toLocaleString('en-NP')} / ${fx.perUnit}`
                    : fx.buy.toLocaleString('en-NP')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {fx.perUnit ? `NPR per ${fx.perUnit} ${fx.code}` : 'Buy rate'}
                  <span style={{ marginLeft: 8 }}>
                    Sell {fx.sell.toLocaleString('en-NP')}
                    {fx.perUnit ? ` / ${fx.perUnit}` : ''}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{fx.name}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dual news feeds */}
        <motion.div
          className="dual-feed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <NewsFeedPanel
            title="Global Market Trends"
            icon={Globe}
            accent="var(--accent)"
            articles={GLOBAL_MARKET_NEWS}
            onViewAll={() => navigate('/news')}
          />
          <NewsFeedPanel
            title="Nepal Economic News"
            icon={MapPin}
            accent="var(--color-orange)"
            articles={NEPAL_ECONOMIC_NEWS}
            onViewAll={() => navigate('/news')}
          />
        </motion.div>
      </div>
    </>
  );
}
