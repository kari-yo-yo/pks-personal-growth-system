import { ThemeConfig } from '@/types';

// ─── 主题定义 ───
// 每个主题通过 CSS 自定义属性覆盖 Tailwind 的颜色系统

export const THEMES: Record<string, ThemeConfig> = {
  ocean: {
    id: 'ocean',
    name: '海洋之心',
    description: '深海蓝青色调，宁静专注的深度学习环境',
    icon: '🌊',
    colors: {
      background: '#060a0f',
      surface: '#0c1620',
      surfaceLight: '#122030',
      primary: '#0ea5e9',
      primaryLight: '#38bdf8',
      accent: '#06b6d4',
      textPrimary: '#f0f9ff',
      textSecondary: '#bae6fd',
      textMuted: '#7dd3fc',
      border: '#1a2a3a',
      success: '#34d399',
      warning: '#fcd34d',
      error: '#fca5a5',
    },
    particleColor: { r: 14, g: 165, b: 233 },
    auraStyle: 'cyan',
    dynamics: 'ocean',
    decorations: ['🐚', '⭐', '🪸', '🌊'],
  },
  forest: {
    id: 'forest',
    name: '森林秘境',
    description: '翠绿森林色调，清新自然的知识探索氛围',
    icon: '🌿',
    colors: {
      background: '#0a1f12',
      surface: '#0f2a1a',
      surfaceLight: '#163820',
      primary: '#22c55e',
      primaryLight: '#4ade80',
      accent: '#16a34a',
      textPrimary: '#f0fdf4',
      textSecondary: '#bbf7d0',
      textMuted: '#86efac',
      border: '#1a3a2a',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
    },
    particleColor: { r: 34, g: 197, b: 94 },
    auraStyle: 'green',
    dynamics: 'forest',
    decorations: ['🌱', '🍃', '🌳', '🍄', '🌸'],
  },
  hope: {
    id: 'hope',
    name: '金色希望',
    description: '暖橙金色调，温馨专注的阅读与思考氛围',
    icon: '☀️',
    colors: {
      background: '#1a1208',
      surface: '#2a1e10',
      surfaceLight: '#3a2a18',
      primary: '#f59e0b',
      primaryLight: '#fbbf24',
      accent: '#d97706',
      textPrimary: '#fffbeb',
      textSecondary: '#fde68a',
      textMuted: '#fcd34d',
      border: '#3a2a10',
      success: '#4ade80',
      warning: '#fb923c',
      error: '#fca5a5',
    },
    particleColor: { r: 245, g: 158, b: 11 },
    auraStyle: 'amber',
    dynamics: 'hope',
    decorations: ['☀️', '🌻', '⭐', '🌅'],
  },
  pink: {
    id: 'pink',
    name: '浪漫粉',
    description: '粉紫渐变色调，温柔梦幻的灵感空间',
    icon: '🌸',
    colors: {
      background: '#1a0a1a',
      surface: '#2a162a',
      surfaceLight: '#3a203a',
      primary: '#f472b6',
      primaryLight: '#f9a8d4',
      accent: '#c084fc',
      textPrimary: '#fce7f3',
      textSecondary: '#fbcfe8',
      textMuted: '#f9a8d4',
      border: '#3a1a3a',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#fb7185',
    },
    particleColor: { r: 244, g: 114, b: 182 },
    auraStyle: 'rose',
    dynamics: 'pink',
    decorations: ['🌸', '🌺', '💗', '✨', '🦋'],
  },
  cosmic: {
    id: 'cosmic',
    name: '宇宙星空',
    description: '深空黑紫色调，沉浸浩瀚的宇宙探索体验',
    icon: '🌌',
    colors: {
      background: '#050510',
      surface: '#0a0a1a',
      surfaceLight: '#12122a',
      primary: '#8b5cf6',
      primaryLight: '#a78bfa',
      accent: '#06b6d4',
      textPrimary: '#e8f0ff',
      textSecondary: '#c4b5fd',
      textMuted: '#a78bfa',
      border: '#1e1e3a',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    particleColor: { r: 139, g: 92, b: 246 },
    auraStyle: 'indigo',
    dynamics: 'cosmic',
    decorations: ['⭐', '🌠', '🌌', '✨'],
  },
};

const STORAGE_KEY = 'pks_theme';

export function getStoredThemeId(): string {
  if (typeof window === 'undefined') return 'ocean';
  return localStorage.getItem(STORAGE_KEY) || 'ocean';
}

export function setStoredThemeId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, id);
}

export function applyThemeToDOM(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const c = theme.colors;

  root.style.setProperty('--color-background', c.background);
  root.style.setProperty('--color-surface', c.surface);
  root.style.setProperty('--color-surface-light', c.surfaceLight);
  root.style.setProperty('--color-primary', c.primary);
  root.style.setProperty('--color-primary-light', c.primaryLight);
  root.style.setProperty('--color-accent', c.accent);
  root.style.setProperty('--color-text-primary', c.textPrimary);
  root.style.setProperty('--color-text-secondary', c.textSecondary);
  root.style.setProperty('--color-text-muted', c.textMuted);
  root.style.setProperty('--color-border', c.border);
  root.style.setProperty('--color-success', c.success);
  root.style.setProperty('--color-warning', c.warning);
  root.style.setProperty('--color-error', c.error);
}

export function getThemeById(id: string): ThemeConfig | undefined {
  return THEMES[id];
}
