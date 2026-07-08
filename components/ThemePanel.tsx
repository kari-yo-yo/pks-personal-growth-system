'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from './ThemeProvider';
import { THEMES } from '@/lib/theme';
import { Check, Palette } from 'lucide-react';

const ThemeAuroraPreview = dynamic(() => import('./ThemeAuroraPreview'), {
  ssr: false,
});

export default function ThemePanel() {
  const { themeId, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const themeList = Object.values(THEMES);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-text-primary">主题</h3>
      </div>
      <p className="text-xs text-text-secondary">
        选择视觉主题，改变整体色彩氛围与动态背景
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {themeList.map((t) => {
          const isActive = themeId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative rounded-xl overflow-hidden border transition-all ${
                isActive
                  ? 'border-primary/40 shadow-lg'
                  : 'border-border hover:border-primary/20'
              }`}
            >
              {/* Canvas preview */}
              <ThemeAuroraPreview
                primary={t.particleColor}
                accent={{
                  r: parseInt(t.colors.accent.slice(1, 3), 16),
                  g: parseInt(t.colors.accent.slice(3, 5), 16),
                  b: parseInt(t.colors.accent.slice(5, 7), 16),
                }}
                background={t.colors.background}
                isSelected={isActive}
              />

              {/* Info */}
              <div className="px-3 py-2 bg-surface">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-primary flex items-center gap-1">
                    <span>{t.icon}</span>
                    {t.name}
                  </span>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
                <p className="text-[10px] text-text-muted mt-0.5 truncate">
                  {t.description}
                </p>
                {/* Decorations */}
                <div className="flex gap-0.5 mt-1 text-[10px]">
                  {t.decorations.slice(0, 3).map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
              </div>

              {/* Selected indicator bar */}
              {isActive && (
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: t.colors.primary }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
