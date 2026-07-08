'use client';

import React from 'react';
import {
  Droplets,
  BookOpen,
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
  { id: 'abyss', label: '深渊', Icon: Droplets, swatchColor: '#38bdf8' },
  { id: 'study', label: '书房', Icon: BookOpen, swatchColor: '#d4a054' },
  { id: 'aurora', label: '极光', Icon: Sparkles, swatchColor: '#34d399' },
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
                   surface border border-[var(--color-border)] text-[var(--color-text-secondary)]
                   hover:text-[var(--color-text-primary)] hover:border-[color-mix(in_srgb,var(--color-primary)_40%,var(--color-border))]
                   transition-all shadow-lg pressable"
        aria-label="切换主题"
        title="切换主题"
      >
        <Palette className="w-5 h-5" />
      </button>

      {/* Collapsible panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 surface-raised border border-[var(--color-border)] p-4 shadow-2xl
                        animate-in fade-in slide-in-from-bottom-4 duration-200">
          <p className="text-xs font-medium text-[var(--color-text-muted)] mb-3 text-center">选择主题</p>

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
                      ? 'bg-[color-mix(in_srgb,var(--color-primary)_10%,var(--color-surface))] text-[var(--color-primary-light)] border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)] border border-transparent'
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
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-primary-light)]' : ''}`} />

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
