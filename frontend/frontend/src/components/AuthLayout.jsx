import Darklogo from "../assets/Darklogo.png";
import Lightlogo from "../assets/Lightlogo.png";

const BAR_HEIGHTS = [38, 55, 42, 78, 95];

function AuthLayout({
  isDarkMode,
  setIsDarkMode,
  title,
  subtitle,
  children,
}) {
  const accentColor = isDarkMode ? "#D90A14" : "#BA7517";

  const barColors = isDarkMode
    ? ["rgba(217,10,20,0.18)", "rgba(217,10,20,0.35)", "rgba(217,10,20,0.52)", "rgba(217,10,20,0.72)", "#D90A14"]
    : ["rgba(186,117,23,0.18)", "rgba(186,117,23,0.35)", "rgba(186,117,23,0.52)", "rgba(186,117,23,0.72)", "#BA7517"];

  return (
    <div className={`inv-root ${isDarkMode ? "inv-dark" : "inv-light"}`}>
      
      {/* LEFT */}
      <div className="inv-left">
        <div className="inv-topbar">
          <img src={isDarkMode ? Darklogo : Lightlogo} className="inv-logo" />
          <button className="inv-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? "☀ Light" : "☾ Dark"}
          </button>
        </div>

        <div className="inv-hero">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {children}
      </div>

      {/* RIGHT */}
      <div className="inv-right">
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
        </div>

        <h2 className="inv-rp-heading">
          Grow Your <span style={{ color: accentColor }}>Wealth</span>
        </h2>

        <p className="inv-rp-sub">
          Manage, track, and grow your finances smarter.
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;