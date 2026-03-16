'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ThemeMode } from '@/types/layout';

interface ThemeContextValue {
  readonly theme: ThemeMode;
  readonly toggleTheme: () => void;
  readonly setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'graficapro-theme';
const BLUE_THEME_CLASS = 'blue-theme';

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'blue' ? 'blue' : 'light';
}

export function ThemeProvider({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const [theme, setThemeRaw] = useState<ThemeMode>('light');

  useEffect(() => {
    setThemeRaw(getStoredTheme());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'blue') {
      root.classList.add(BLUE_THEME_CLASS);
    } else {
      root.classList.remove(BLUE_THEME_CLASS);
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeRaw(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeRaw((prev) => (prev === 'light' ? 'blue' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
