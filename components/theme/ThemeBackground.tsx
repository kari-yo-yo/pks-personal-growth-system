'use client';

import { useEffect, useState, useRef } from 'react';
import { ThemeType } from '@/types';
import OceanBg from './OceanBg';
import ForestBg from './ForestBg';
import HopeBg from './HopeBg';
import PinkBg from './PinkBg';
import CosmicBg from './CosmicBg';

interface Props {
  theme: ThemeType;
}

const TRANSITION_DURATION = 500; // ms

export default function ThemeBackground({ theme }: Props) {
  const [displayTheme, setDisplayTheme] = useState<ThemeType>(theme);
  const [opacity, setOpacity] = useState(1);
  const prevThemeRef = useRef<ThemeType>(theme);

  useEffect(() => {
    if (theme === prevThemeRef.current) return;

    // Fade out
    setOpacity(0);

    const timer = setTimeout(() => {
      setDisplayTheme(theme);
      prevThemeRef.current = theme;
      // Fade in
      setOpacity(1);
    }, TRANSITION_DURATION);

    return () => clearTimeout(timer);
  }, [theme]);

  const renderBg = (t: ThemeType) => {
    switch (t) {
      case 'ocean':
        return <OceanBg />;
      case 'forest':
        return <ForestBg />;
      case 'hope':
        return <HopeBg />;
      case 'pink':
        return <PinkBg />;
      case 'cosmic':
        return <CosmicBg />;
      default:
        return <CosmicBg />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity,
        transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
      }}
    >
      {renderBg(displayTheme)}
    </div>
  );
}
