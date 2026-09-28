// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'System',
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'System';
    } catch {
      return 'System';
    }
  });

  const applyTheme = (mode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (mode === 'System') {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', String(mode).toLowerCase());
    }
  };

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {}

    if (theme === 'System' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) =>
        document.documentElement.setAttribute(
          'data-theme',
          e.matches ? 'dark' : 'light'
        );
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const setTheme = (mode) => setThemeState(mode);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}