'use client'

import React, { createContext, useContext, useEffect, useState } from "react";

// Ponieważ nie możemy zainstalować next-themes, zaimplementujmy prostą wersję
type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: string;
}

const initialState = {
  theme: 'system' as Theme,
  setTheme: (theme: Theme) => {},
  systemTheme: 'light' as Theme,
};

const ThemeContext = createContext(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  attribute = 'class',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<Theme>('light');

  // Efekt do wykrywania preferencji systemowych
  useEffect(() => {
    if (!enableSystem) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };
    
    updateSystemTheme();
    mediaQuery.addEventListener('change', updateSystemTheme);
    
    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme);
    };
  }, [enableSystem]);

  // Efekt do aplikowania motywu
  useEffect(() => {
    const root = document.documentElement;
    const activeTheme = theme === 'system' ? systemTheme : theme;
    
    if (attribute === 'class') {
      if (activeTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      root.setAttribute(attribute, activeTheme);
    }
  }, [theme, systemTheme, attribute]);

  const setTheme = (theme: Theme) => {
    setThemeState(theme);
    localStorage.setItem('theme', theme);
  };

  // Efekt do załadowania motywu z localStorage przy starcie
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  const providerValue = {
    theme,
    setTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={providerValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
