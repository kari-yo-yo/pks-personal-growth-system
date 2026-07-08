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
import AbyssBg from '@/components/themes/AbyssBg';
import StudyBg from '@/components/themes/StudyBg';
import AuroraBg from '@/components/themes/AuroraBg';

/* ─── Context Type ─── */
interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: ThemeId;
  setTheme: (id: string) => void;
  themes: Record<string, ThemeConfig>;
}

const defaultThemeValue: ThemeContextValue = {
  theme: THEMES['abyss'],
  themeId: 'abyss',
  setTheme: () => {},
  themes: THEMES as Record<string, ThemeConfig>,
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeValue);

/* ─── useTheme Hook ─── */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/* ─── Bg Component Map ─── */
const bgComponentMap: Record<ThemeId, React.ComponentType> = {
  abyss: AbyssBg,
  study: StudyBg,
  aurora: AuroraBg,
};

function getBgComponent(id: string): React.ComponentType {
  return bgComponentMap[id as ThemeId] || AbyssBg;
}

/* ─── ThemeProvider ─── */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>('abyss');
  const [prevTheme, setPrevTheme] = useState<ThemeId>('abyss');
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'fade-out' | 'fade-in'>('idle');
  const [mounted, setMounted] = useState(false);

  /* Mount: read stored theme & apply */
  useEffect(() => {
    const id = getStoredThemeId();
    if (id && id !== 'abyss' && THEMES[id]) {
      setThemeIdState(id);
      applyThemeToDOM(THEMES[id]);
      document.documentElement.setAttribute('data-theme', id);
    } else {
      applyThemeToDOM(THEMES['abyss']);
      document.documentElement.setAttribute('data-theme', 'abyss');
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

      setTimeout(() => {
        setThemeIdState(themeIdCast);
        setStoredThemeId(themeIdCast);
        applyThemeToDOM(THEMES[themeIdCast]);
        document.documentElement.setAttribute('data-theme', themeIdCast);
        setTransitionPhase('fade-in');

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
