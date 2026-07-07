'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ThemeConfig } from '@/types';
import { THEMES, getStoredThemeId, setStoredThemeId, applyThemeToDOM } from '@/lib/theme';
import ThemeDynamics from './theme/ThemeDynamics';

interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: string;
  setTheme: (id: string) => void;
  themes: Record<string, ThemeConfig>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState('deepSpace');
  const [mounted, setMounted] = useState(false);

  // 初始化 — 从 localStorage 读取
  useEffect(() => {
    const stored = getStoredThemeId();
    if (THEMES[stored]) {
      setThemeIdState(stored);
      applyThemeToDOM(THEMES[stored]);
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((id: string) => {
    const theme = THEMES[id];
    if (!theme) return;
    setThemeIdState(id);
    setStoredThemeId(id);
    applyThemeToDOM(theme);
  }, []);

  const theme = THEMES[themeId] || THEMES.deepSpace;

  // 防止 SSR 水合不匹配
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, themes: THEMES }}>
      <ThemeDynamics dynamics={theme.dynamics} />
      {children}
    </ThemeContext.Provider>
  );
}
