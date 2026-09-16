'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext<{ theme: string; setTheme: (theme: string) => void }>({
  theme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      document.documentElement.style.colorScheme = savedTheme;
    }
  }, []);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      document.documentElement.style.colorScheme = newTheme;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: toggleTheme }}>
      <div className={theme === 'dark' ? 'dark' : ''} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
