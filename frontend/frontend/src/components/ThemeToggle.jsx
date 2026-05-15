import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="inv-btn-icon" 
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{ padding: '0', fontSize: '20px' }}
    >
      {isDarkMode ? "☀️" : "🌙"}
    </button>
  );
}
