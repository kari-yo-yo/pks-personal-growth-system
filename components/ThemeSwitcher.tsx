'use client';

import React from 'react';
import {
  Waves,
  TreePine,
  Sunrise,
  Heart,
  Feather,
  Sparkles,
  Palette,
} from 'lucide-react';
import { THEMES, ThemeId } from '@/lib/themeConfig';
import { useTheme } from '@/components/ThemeProvider';

/* ─── Theme Meta ─── */
interface ThemeMeta {
  id: ThemeId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  swatchColor: string;
}

const themeMetaList: ThemeMeta[] = [
  { id: 'ocean', label: '海洋', Icon: Waves, swatchColor: '#0ea5e9' },
  { id: 'forest', label: '森林', Icon: TreePine, swatchColor: '#22c55e' },
  { id: 'hope', label: '希望', Icon: Sunrise, swatchColor: '#f59e0b' },
  { id: 'pink', label: '粉黛', Icon: Heart, swatchColor: '#ec4899' },
  { id: 'ink', label: '墨韵', Icon: Feather, swatchColor: '#64748b' },
  { id: 'cosmic', label: '宇宙', Icon: Sparkles, swatchColor: '#8b5cf6' },
];

/* ─── Props ─── */
interface ThemeSwitcherProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

/* ─── ThemeSwitcher ─── */
export default function ThemeSwitcher({ isOpen = false, onToggle }: ThemeSwitcherProps) {
  const { themeId, setTheme } = useTheme();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-11 h-11 rounded-full
                   bg-surface border border-border text-text-secondary hover:text-text-primary
                   hover:border-primary/40 transition-all shadow-lg hover:shadow-primary/10"
        aria-label="切换主题"
        title="切换主题"
      >
        <Palette className="w-5 h-5" />
      </button>

      {/* Collapsible panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 glass rounded-2xl border border-border p-4 shadow-2xl
                        animate-in fade-in slide-in-from-bottom-4 duration-200">
          <p className="text-xs font-medium text-text-muted mb-3 text-center">选择主题</p>

          <div className="grid grid-cols-3 gap-2">
            {themeMetaList.map(({ id, label, Icon, swatchColor }) => {
              const isActive = themeId === id;
              return (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={`
                    relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl
                    text-xs transition-all duration-200 min-w-[72px]
                    ${isActive
                      ? 'bg-primary/10 text-primary-light border border-primary/30 shadow-[0_0_12px_-2px_rgba(var(--primary-rgb,99,102,241),0.3)]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-light border border-transparent'
                    }
                  `}
                  title={label}
                >
                  {/* Color swatch dot */}
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                    style={{ backgroundColor: swatchColor }}
                  />

                  {/* Icon */}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary-light' : ''}`} />

                  {/* Label */}
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}