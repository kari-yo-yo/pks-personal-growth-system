export type ThemeId = 'ocean' | 'forest' | 'hope' | 'pink' | 'ink' | 'cosmic';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  primaryLight: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  icon: string;
  description: string;
  colors: ThemeColors;
  particleColor: { r: number; g: number; b: number };
  auraStyle: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  ocean: {
    id: 'ocean',
    name: '海洋之心',
    icon: '🌊',
    description: '碧波万顷，深海之息 — 从空中俯瞰的碧蓝海洋，轻舟点点',
    colors: {
      background: '#061a24',
      surface: '#0f3a4a',
      surfaceLight: '#1a4a5a',
      primary: '#2dd4bf',
      primaryLight: '#5eead4',
      accent: '#22d3ee',
      textPrimary: '#e0f8f4',
      textSecondary: '#94d4c8',
      textMuted: '#5a8a80',
      border: '#1a4a5a',
      success: '#2dd4bf',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    particleColor: { r: 45, g: 212, b: 191 },
    auraStyle: 'radial-gradient(ellipse at 30% 50%, rgba(45,212,191,0.15) 0%, transparent 70%), radial-gradient(ellipse at 70% 20%, rgba(34,211,238,0.10) 0%, transparent 60%)',
  },

  forest: {
    id: 'forest',
    name: '森林秘境',
    icon: '🌿',
    description: '虫眼仰望，树冠如盖 — 竹影婆娑，绿意盎然的原始森林',
    colors: {
      background: '#0f1a0f',
      surface: '#1a3a1a',
      surfaceLight: '#2a4a2a',
      primary: '#7cb342',
      primaryLight: '#aed581',
      accent: '#8bc34a',
      textPrimary: '#e0f0d8',
      textSecondary: '#92b882',
      textMuted: '#4a6a40',
      border: '#1a3a1a',
      success: '#7cb342',
      warning: '#f59e0b',
      error: '#ef5350',
    },
    particleColor: { r: 124, g: 179, b: 66 },
    auraStyle: 'radial-gradient(ellipse at 50% 0%, rgba(124,179,66,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(139,195,74,0.08) 0%, transparent 50%)',
  },

  hope: {
    id: 'hope',
    name: '金色希望',
    icon: '☀️',
    description: '粉沙碧海，落日熔金 — 热带天堂的粉色沙滩，沐浴在金色余晖中',
    colors: {
      background: '#1a1208',
      surface: '#3a2a10',
      surfaceLight: '#4a3a1a',
      primary: '#f59e0b',
      primaryLight: '#fbbf24',
      accent: '#f97316',
      textPrimary: '#faf0e0',
      textSecondary: '#c4a870',
      textMuted: '#7a6040',
      border: '#3a2a10',
      success: '#f59e0b',
      warning: '#eab308',
      error: '#ef4444',
    },
    particleColor: { r: 245, g: 158, b: 11 },
    auraStyle: 'radial-gradient(ellipse at 70% 20%, rgba(245,158,11,0.15) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(251,191,36,0.10) 0%, transparent 50%)',
  },

  pink: {
    id: 'pink',
    name: '粉色浪漫',
    icon: '🌸',
    description: '雅法古巷，花影扶疏 — 粉色花簇掩映的金色阶梯，暖意融融',
    colors: {
      background: '#1a1018',
      surface: '#2a1a28',
      surfaceLight: '#3a2a38',
      primary: '#f472b6',
      primaryLight: '#f9a8d4',
      accent: '#e879f9',
      textPrimary: '#faf0f4',
      textSecondary: '#d4a8b8',
      textMuted: '#7a5a68',
      border: '#2a1a28',
      success: '#f472b6',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    particleColor: { r: 244, g: 114, b: 182 },
    auraStyle: 'radial-gradient(ellipse at 40% 30%, rgba(244,114,182,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(232,121,249,0.08) 0%, transparent 50%)',
  },

  ink: {
    id: 'ink',
    name: '水墨丹青',
    icon: '🎨',
    description: '烟雨朦胧，飞瀑流泉 — 远山如黛，墨韵诗意，朱印点晴',
    colors: {
      background: '#0a0a08',
      surface: '#1a1a15',
      surfaceLight: '#2a2a20',
      primary: '#c4a35a',
      primaryLight: '#d4c08a',
      accent: '#8b7355',
      textPrimary: '#e8e0d0',
      textSecondary: '#b0a890',
      textMuted: '#605848',
      border: '#1a1a15',
      success: '#c4a35a',
      warning: '#d4a040',
      error: '#bf4040',
    },
    particleColor: { r: 196, g: 163, b: 90 },
    auraStyle: 'radial-gradient(ellipse at 50% 30%, rgba(196,163,90,0.10) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(139,115,85,0.08) 0%, transparent 50%)',
  },

  cosmic: {
    id: 'cosmic',
    name: '银河星际',
    icon: '🌌',
    description: '星河璀璨，雪峰映辉 — 银河横跨夜空，流星划过雪山之巅',
    colors: {
      background: '#050510',
      surface: '#0e0e24',
      surfaceLight: '#1a1a3a',
      primary: '#d4a574',
      primaryLight: '#e8c49a',
      accent: '#8b5cf6',
      textPrimary: '#e8e4f0',
      textSecondary: '#a89cc0',
      textMuted: '#585070',
      border: '#1a1a3a',
      success: '#d4a574',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    particleColor: { r: 212, g: 165, b: 116 },
    auraStyle: 'radial-gradient(ellipse at 50% 20%, rgba(212,165,116,0.10) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(139,91,246,0.08) 0%, transparent 50%)',
  },
};

export function getStoredThemeId(): ThemeId {
  if (typeof window === 'undefined') return 'ocean';
  try {
    const stored = localStorage.getItem('km-theme-id');
    if (stored && THEMES[stored as ThemeId]) return stored as ThemeId;
  } catch {
    // localStorage not available
  }
  return 'ocean';
}

export function setStoredThemeId(id: ThemeId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('km-theme-id', id);
  } catch {
    // localStorage not available
  }
}

export function applyThemeToDOM(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const { colors } = theme;

  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-surface-light', colors.surfaceLight);
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-light', colors.primaryLight);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-muted', colors.textMuted);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);
  root.style.setProperty('--color-aura', theme.auraStyle);
}