'use client';

import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import {
  THEMES,
  ThemeId,
  ThemeConfig,
  getStoredThemeId,
  setStoredThemeId,
  applyThemeToDOM,
} from '@/lib/themeConfig';
import OceanBg from '@/components/themes/OceanBg';
import ForestBg from '@/components/themes/ForestBg';
import HopeBg from '@/components/themes/HopeBg';
import PinkBg from '@/components/themes/PinkBg';
import InkBg from '@/components/themes/InkBg';
import CosmicBg from '@/components/themes/CosmicBg';

/* ─── Context Type ─── */
interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: ThemeId;
  setTheme: (id: string) => void;
  themes: Record<string, ThemeConfig>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ─── useTheme Hook ─── */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

/* ─── Bg Component Map ─── */
const bgComponentMap: Record<ThemeId, React.ComponentType> = {
  ocean: OceanBg,
  forest: ForestBg,
  hope: HopeBg,
  pink: PinkBg,
  ink: InkBg,
  cosmic: CosmicBg,
};

function getBgComponent(id: string): React.ComponentType {
  return bgComponentMap[id as ThemeId] || OceanBg;
}

/* ─── ThemeProvider ─── */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always use 'ocean' as the initial theme to avoid hydration mismatch.
  // The actual stored theme is applied in useEffect after mount.
  const [themeId, setThemeIdState] = useState<ThemeId>('ocean');
  const [prevTheme, setPrevTheme] = useState<ThemeId>('ocean');
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'fade-out' | 'fade-in'>('idle');
  const [mounted, setMounted] = useState(false);

  /* Mount: read stored theme & apply */
  useEffect(() => {
    const id = getStoredThemeId();
    if (id && id !== 'ocean' && THEMES[id]) {
      setThemeIdState(id);
      applyThemeToDOM(THEMES[id]);
      document.documentElement.setAttribute('data-theme', id);
    } else {
      applyThemeToDOM(THEMES['ocean']);
      document.documentElement.setAttribute('data-theme', 'ocean');
    }
    setMounted(true);
  }, []);

  /* switchTheme */
  const switchTheme = useCallback(
    (id: string) => {
      const themeIdCast = id as ThemeId;
      if (id === themeId || !THEMES[themeIdCast]) return;

      setPrevTheme(themeId);
      setTransitionPhase('fade-out');

      // After 100ms, start applying new theme
      setTimeout(() => {
        setThemeIdState(themeIdCast);
        setStoredThemeId(themeIdCast);
        applyThemeToDOM(THEMES[themeIdCast]);
        document.documentElement.setAttribute('data-theme', themeIdCast);
        setTransitionPhase('fade-in');

        // After 500ms more (600ms total), end transition
        setTimeout(() => setTransitionPhase('idle'), 500);
      }, 100);
    },
    [themeId],
  );

  const value: ThemeContextValue = {
    theme: THEMES[themeId],
    themeId,
    setTheme: switchTheme,
    themes: THEMES as Record<string, ThemeConfig>,
  };

  const PrevBgComponent = getBgComponent(prevTheme);
  const CurrentBgComponent = getBgComponent(themeId);

  return (
    <ThemeContext.Provider value={value}>
      {/* Background layer with crossfade */}
      <div className="fixed inset-0 z-0">
        {/* Previous theme background - fading out */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: transitionPhase !== 'idle' ? 0 : 1,
            transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
          }}
        >
          {mounted && <PrevBgComponent />}
        </div>

        {/* Current / New theme background - fading in */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: transitionPhase !== 'fade-out' ? 1 : 0,
            transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
          }}
        >
          {mounted && <CurrentBgComponent />}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </ThemeContext.Provider>
  );
}