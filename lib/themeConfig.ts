export type ThemeId = 'abyss' | 'study' | 'aurora';

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
  abyss: {
    id: 'abyss',
    name: '深渊宁静',
    icon: '🌊',
    description: '深海般的沉静与专注，黑暗中漂浮着微弱的光点',
    colors: {
      background: '#06080e',
      surface: '#0e1420',
      surfaceLight: '#1a2238',
      primary: '#38bdf8',
      primaryLight: '#7dd3fc',
      accent: '#06b6d4',
      textPrimary: '#e8f0f8',
      textSecondary: '#8aacc0',
      textMuted: '#4a6a80',
      border: '#1a2238',
      success: '#38bdf8',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    particleColor: { r: 56, g: 189, b: 248 },
    auraStyle: 'radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.08) 0%, transparent 70%)',
  },

  study: {
    id: 'study',
    name: '暖沙书房',
    icon: '📚',
    description: '像老旧书房一样温暖安心，金色灰尘在光柱中飘浮',
    colors: {
      background: '#1a1510',
      surface: '#2a2318',
      surfaceLight: '#3a3228',
      primary: '#d4a054',
      primaryLight: '#e8c08a',
      accent: '#c07830',
      textPrimary: '#f0e8d8',
      textSecondary: '#b0a088',
      textMuted: '#7a6a58',
      border: '#3a3228',
      success: '#d4a054',
      warning: '#e8a020',
      error: '#ef4444',
    },
    particleColor: { r: 212, g: 160, b: 84 },
    auraStyle: 'radial-gradient(ellipse at 30% 50%, rgba(212,160,84,0.06) 0%, transparent 70%)',
  },

  aurora: {
    id: 'aurora',
    name: '极光冰原',
    icon: '🌌',
    description: '极光下的冰原，壮丽而冷静的签名主题',
    colors: {
      background: '#040810',
      surface: '#0a1428',
      surfaceLight: '#142040',
      primary: '#34d399',
      primaryLight: '#6ee7b7',
      accent: '#818cf8',
      textPrimary: '#e8f4f0',
      textSecondary: '#80b8a8',
      textMuted: '#407068',
      border: '#142040',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#ef4444',
    },
    particleColor: { r: 52, g: 211, b: 153 },
    auraStyle: 'radial-gradient(ellipse at 50% 20%, rgba(52,211,153,0.10) 0%, transparent 60%)',
  },
};

// Backward compatibility: map old theme IDs to new ones
const OLD_THEME_MAP: Record<string, ThemeId> = {
  ocean: 'abyss',
  forest: 'study',
  hope: 'study',
  pink: 'study',
  ink: 'study',
  cosmic: 'aurora',
};

export function getStoredThemeId(): ThemeId {
  if (typeof window === 'undefined') return 'abyss';
  try {
    const stored = localStorage.getItem('km-theme-id');
    if (!stored) return 'abyss';
    // Direct match
    if (THEMES[stored as ThemeId]) return stored as ThemeId;
    // Old theme migration
    const migrated = OLD_THEME_MAP[stored];
    if (migrated) {
      localStorage.setItem('km-theme-id', migrated);
      return migrated;
    }
  } catch {
    // localStorage not available
  }
  return 'abyss';
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
