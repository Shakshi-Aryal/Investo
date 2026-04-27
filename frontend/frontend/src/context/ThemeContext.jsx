import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
    // Set data attribute on the document element for global CSS targeting
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    // Dispatch storage event in case other components depend on it across tabs/components
    window.dispatchEvent(new Event("storage"));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
