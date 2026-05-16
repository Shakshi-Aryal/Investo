import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Globe, MapPin, TrendingUp, DollarSign, Activity, ChevronRight, Newspaper } from 'lucide-react';

const portalStyles = `
  .portal-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* ── COMMODITIES & EXCHANGE TABS ── */
  .market-strip {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
  .market-strip::-webkit-scrollbar { display: none; }

  .market-ticker-card {
    min-width: 200px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 16px;
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  }

  .ticker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .ticker-price {
    font-size: 20px;
    font-weight: 800;
    font-family: var(--font-heading);
    color: var(--text-main);
  }

  .ticker-change {
    font-size: 13px;
    font-weight: 700;
  }
  .ticker-change.up { color: var(--success-color); }
  .ticker-change.down { color: var(--danger-color); }

  /* ── LAYOUT ── */
  .news-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
    align-items: start;
  }

  @media (max-width: 992px) {
    .news-layout {
      grid-template-columns: 1fr;
    }
  }

  .news-section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 700;
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .news-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }

  .news-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
    border-color: var(--accent);
  }

  .news-img {
    width: 100%;
    height: 180px;
    background: var(--input-bg);
    object-fit: cover;
  }

  .news-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .news-source {
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .news-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-main);
    margin: 0 0 12px;
    line-height: 1.4;
  }

  .news-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-muted);
  }

  /* ── SIDE PANEL ── */
  .side-panel {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 24px;
    padding: 24px;
    position: sticky;
    top: 100px;
  }

  .side-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .side-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: var(--input-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    transition: 0.2s;
    cursor: pointer;
  }

  .side-item:hover {
    border-color: var(--accent);
    background: var(--accent-dim);
  }

  .side-item-content h4 {
    margin: 0 0 4px;
    font-size: 14px;
    line-height: 1.4;
    color: var(--text-main);
  }
  .side-item-content p {
    margin: 0;
    font-size: 11px;
    color: var(--text-muted);
  }

  .toggle-bar {
    display: flex;
    background: var(--input-bg);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 24px;
    border: 1px solid var(--card-border);
  }

  .toggle-btn {
    flex: 1;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    transition: 0.2s;
    color: var(--text-muted);
  }

  .toggle-btn.active {
    background: var(--accent);
    color: white;
    box-shadow: 0 4px 12px var(--accent-glow);
  }
`;

// MOCK DATA
const MOCK_RATES = [
  { label: 'Fine Gold (99.99%)', value: 'Rs. 150,200', unit: 'per Tola', change: '+1.2%', up: true, icon: <TrendingUp size={14} /> },
  { label: 'Tejabi Gold', value: 'Rs. 149,400', unit: 'per Tola', change: '+1.1%', up: true, icon: <TrendingUp size={14} /> },
  { label: 'Silver', value: 'Rs. 1,850', unit: 'per Tola', change: '-0.5%', up: false, icon: <TrendingUp size={14} /> },
  { label: 'USD / NPR', value: 'Rs. 133.45', unit: 'Buy', change: '+0.1%', up: true, icon: <DollarSign size={14} /> },
  { label: 'EUR / NPR', value: 'Rs. 144.20', unit: 'Buy', change: '-0.2%', up: false, icon: <DollarSign size={14} /> },
  { label: 'GBP / NPR', value: 'Rs. 168.90', unit: 'Buy', change: '+0.4%', up: true, icon: <DollarSign size={14} /> },
];

const GLOBAL_NEWS = [
  { id: 1, source: 'Bloomberg', title: 'Federal Reserve Signals Potential Rate Cuts Later This Year Amid Easing Inflation', time: '2 hours ago', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80' },
  { id: 2, source: 'Reuters', title: 'Tech Stocks Surge as AI Demand Continues to Outpace Analyst Expectations', time: '4 hours ago', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
  { id: 3, source: 'Financial Times', title: 'Global Oil Prices Stabilize After Week of Volatile Trading', time: '6 hours ago', img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80' },
];

const NEPAL_NEWS = [
  { id: 1, source: 'Kathmandu Post', title: 'NEPSE Index Crosses 2200 Mark Backed by Hydropower Sector Rally', time: '1 hour ago', img: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80' },
  { id: 2, source: 'Himalayan Times', title: 'Remittance Inflows Rise by 21% in First Quarter of Fiscal Year', time: '3 hours ago', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80' },
  { id: 3, source: 'NRB Updates', title: 'Central Bank Introduces New Guidelines for Digital Lending Platforms', time: '5 hours ago', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80' },
  { id: 4, source: 'Bizmandu', title: 'Tourism Sector Recovery Boosts Foreign Exchange Reserves', time: '7 hours ago', img: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=800&q=80' },
];

export default function NewsPortal() {
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'nepal'

  const mainNews = activeTab === 'global' ? GLOBAL_NEWS : NEPAL_NEWS;
  const sideNews = activeTab === 'global' ? NEPAL_NEWS : GLOBAL_NEWS;

  return (
    <MainLayout>
      <style>{portalStyles}</style>
      <div className="portal-container">
        
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
            Global & Domestic <span style={{ color: 'var(--accent)' }}>Economic Feed</span>
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '16px' }}>
            NPR FX grid, bullion ticker, and dual global/Nepal news panels.
          </p>
        </div>

        {/* Commodity & Exchange Strip */}
        <div className="market-strip">
          {MOCK_RATES.map((rate, idx) => (
            <div key={idx} className="market-ticker-card">
              <div className="ticker-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {rate.icon} {rate.label}
                </span>
                <span className={`ticker-change ${rate.up ? 'up' : 'down'}`}>
                  {rate.change}
                </span>
              </div>
              <div>
                <span className="ticker-price">{rate.value}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '6px' }}>{rate.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="news-layout">
          {/* Main Feed */}
          <div>
            <div className="toggle-bar" style={{ display: 'none' /* hidden on desktop, used for mobile if needed */ }}>
              <div className={`toggle-btn ${activeTab === 'global' ? 'active' : ''}`} onClick={() => setActiveTab('global')}>Global News</div>
              <div className={`toggle-btn ${activeTab === 'nepal' ? 'active' : ''}`} onClick={() => setActiveTab('nepal')}>Nepal Economy</div>
            </div>

            <h2 className="news-section-header">
              {activeTab === 'global' ? <><Globe color="var(--accent)" /> Global Markets Feed</> : <><MapPin color="var(--accent)" /> Nepal Economic Updates</>}
            </h2>

            <div className="news-grid">
              {mainNews.map(news => (
                <div key={news.id} className="news-card">
                  <img src={news.img} alt={news.title} className="news-img" />
                  <div className="news-content">
                    <div className="news-source"><Newspaper size={14} /> {news.source}</div>
                    <h3 className="news-title">{news.title}</h3>
                    <div className="news-footer">
                      <span>{news.time}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="side-panel">
            <h3 style={{ margin: '0 0 20px', fontFamily: 'var(--font-heading)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--accent)" />
              {activeTab === 'global' ? 'Local Briefings' : 'Global Briefings'}
            </h3>
            
            <div className="side-list">
              {sideNews.map(news => (
                <div key={news.id} className="side-item">
                  <div style={{ flex: 1 }} className="side-item-content">
                    <h4>{news.title}</h4>
                    <p>{news.source} • {news.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setActiveTab(activeTab === 'global' ? 'nepal' : 'global')}
              style={{
                width: '100%', marginTop: '24px', padding: '12px',
                background: 'var(--input-bg)', border: '1px solid var(--card-border)',
                borderRadius: '12px', color: 'var(--text-main)', fontWeight: '600',
                cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              Switch to {activeTab === 'global' ? 'Nepal Economy' : 'Global Markets'} <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}