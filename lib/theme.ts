import { ThemeConfig } from '@/types';

// ─── 主题定义 ───
// 每个主题通过 CSS 自定义属性覆盖 Tailwind 的颜色系统

export const THEMES: Record<string, ThemeConfig> = {
  deepSpace: {
    id: 'deepSpace',
    name: '深空',
    description: '默认深空主题，靛蓝主色调，沉浸式暗色体验',
    colors: {
      background: '#0a0a0f',
      surface: '#13131f',
      surfaceLight: '#1a1a2e',
      primary: '#6366f1',
      primaryLight: '#818cf8',
      accent: '#8b5cf6',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      border: '#27273a',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    particleColor: { r: 99, g: 102, b: 241 },
    auraStyle: 'indigo',
  },
  aurora: {
    id: 'aurora',
    name: '极光',
    description: '翠绿极光色调，清新自然的知识探索氛围',
    colors: {
      background: '#060d0a',
      surface: '#0d1a14',
      surfaceLight: '#142420',
      primary: '#10b981',
      primaryLight: '#34d399',
      accent: '#06d6a0',
      textPrimary: '#ecfdf5',
      textSecondary: '#a7f3d0',
      textMuted: '#6ee7b7',
      border: '#1a3a2a',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
    },
    particleColor: { r: 16, g: 185, b: 129 },
    auraStyle: 'green',
  },
  nebula: {
    id: 'nebula',
    name: '星云',
    description: '玫瑰星云色调，温暖柔和的学习空间',
    colors: {
      background: '#0f0a0e',
      surface: '#1a1218',
      surfaceLight: '#251a22',
      primary: '#e879a0',
      primaryLight: '#f09d7b',
      accent: '#f472b6',
      textPrimary: '#fdf2f8',
      textSecondary: '#fbcfe8',
      textMuted: '#f9a8d4',
      border: '#3a1a2e',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#fb7185',
    },
    particleColor: { r: 232, g: 121, b: 160 },
    auraStyle: 'rose',
  },
  ocean: {
    id: 'ocean',
    name: '深海',
    description: '深海蓝青色调，宁静专注的深度学习环境',
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
  },
  amber: {
    id: 'amber',
    name: '琥珀',
    description: '琥珀暖色调，温馨专注的阅读与思考氛围',
    colors: {
      background: '#0f0b06',
      surface: '#1a1408',
      surfaceLight: '#251e10',
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
  },
  monochrome: {
    id: 'monochrome',
    name: '水墨',
    description: '黑白水墨风格，极简纯净的沉浸体验',
    colors: {
      background: '#0a0a0a',
      surface: '#141414',
      surfaceLight: '#1e1e1e',
      primary: '#a1a1aa',
      primaryLight: '#d4d4d8',
      accent: '#71717a',
      textPrimary: '#fafafa',
      textSecondary: '#d4d4d8',
      textMuted: '#a1a1aa',
      border: '#27272a',
      success: '#a3e635',
      warning: '#facc15',
      error: '#f87171',
    },
    particleColor: { r: 161, g: 161, b: 170 },
    auraStyle: 'gray',
  },
};

const STORAGE_KEY = 'pks_theme';

export function getStoredThemeId(): string {
  if (typeof window === 'undefined') return 'deepSpace';
  return localStorage.getItem(STORAGE_KEY) || 'deepSpace';
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
