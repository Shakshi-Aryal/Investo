import React from "react";

/* ─── Extract Styles for the Right Panel ─────────────────────────────────── */
const panelCss = `
  .inv-right {
    width: 45%;
    min-height: 100vh;
    background: var(--panel-bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
    position: relative;
    overflow: hidden;
  }

  .inv-right-deco {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .inv-chart-wrap {
    position: relative;
    width: 200px;
    height: 150px;
    margin-bottom: 32px;
    flex-shrink: 0;
  }

  .inv-bar {
    position: absolute;
    bottom: 0;
    border-radius: 7px 7px 0 0;
    transition: height 0.5s ease;
  }

  .inv-chart-arrow {
    position: absolute;
    top: -14px;
    right: -14px;
  }

  .inv-rp-heading {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    text-align: center;
    line-height: 1.25;
    letter-spacing: -0.5px;
    margin-bottom: 12px;
  }
  .inv-rp-heading span { color: var(--accent); }

  .inv-rp-sub {
    font-size: 14px;
    text-align: center;
    color: var(--label);
    max-width: 240px;
    line-height: 1.65;
    margin-bottom: 28px;
  }

  .inv-stats {
    display: flex;
    gap: 14px;
    margin-bottom: 24px;
  }

  .inv-stat {
    background: var(--accent-dim);
    border: 1px solid var(--card-border);
    border-radius: 14px;
    padding: 14px 20px;
    text-align: center;
    flex: 1;
  }
  .inv-stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .inv-stat-label {
    font-size: 11px;
    color: var(--label);
    margin-top: 4px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  .inv-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .inv-tag {
    background: var(--tag-bg);
    color: var(--tag-color);
    border-radius: 30px;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .inv-right { display: none; }
  }
`;

const BAR_HEIGHTS = [38, 55, 42, 78, 95];

const InvestoRightPanel = ({ isDarkMode }) => {
  const accentColor = isDarkMode ? "#D90A14" : "#BA7517";
  
  const barColors = isDarkMode
    ? ["rgba(217,10,20,0.18)", "rgba(217,10,20,0.35)", "rgba(217,10,20,0.52)", "rgba(217,10,20,0.72)", "#D90A14"]
    : ["rgba(186,117,23,0.18)", "rgba(186,117,23,0.35)", "rgba(186,117,23,0.52)", "rgba(186,117,23,0.72)", "#BA7517"];

  return (
    <>
      <style>{panelCss}</style>
      <div className="inv-right">
        {/* Decorative blobs */}
        <div
          className="inv-right-deco"
          style={{
            width: 320, height: 320,
            top: -100, right: -80,
            background: accentColor,
            opacity: isDarkMode ? 0.06 : 0.08,
          }}
        />
        <div
          className="inv-right-deco"
          style={{
            width: 220, height: 220,
            bottom: -70, left: -60,
            background: accentColor,
            opacity: isDarkMode ? 0.06 : 0.08,
          }}
        />

        {/* Mini bar chart */}
        <div className="inv-chart-wrap">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="inv-bar"
              style={{
                left: i * 40,
                width: 28,
                height: h,
                background: barColors[i],
              }}
            />
          ))}
          {/* Arrow */}
          <svg
            className="inv-chart-arrow"
            width="36"
            height="36"
            viewBox="0 0 36 36"
          >
            <circle cx="18" cy="18" r="16" fill={accentColor} opacity="0.15" />
            <polyline
              points="10,24 15,14 21,19 28,10"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <polygon points="25,8 31,8 31,14" fill={accentColor} />
          </svg>
        </div>

        <div className="inv-rp-heading">
          Grow Your <span>Wealth</span><br />Smarter
        </div>
        <p className="inv-rp-sub">
          Track spending, manage investments, and reach your financial goals — all in one place.
        </p>

        <div className="inv-stats">
          <div className="inv-stat">
            <div className="inv-stat-num">2.4M+</div>
            <div className="inv-stat-label">Users</div>
          </div>
          <div className="inv-stat">
            <div className="inv-stat-num">98%</div>
            <div className="inv-stat-label">Satisfaction</div>
          </div>
        </div>

        <div className="inv-tags">
          {["Budgeting", "Investments", "Analytics", "Goals"].map((t) => (
            <span key={t} className="inv-tag">{t}</span>
          ))}
        </div>
      </div>
    </>
  );
};

export default InvestoRightPanel;