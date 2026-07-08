# 主题重设计文档 - 精简至 3 个高品质主题

## 概述

将现有 6 个主题（ocean/forest/hope/pink/ink/cosmic）精简为 3 个极致品质主题。每个主题都有独特的视觉签名、情感定位和技术实现。

## 主题定义

### 1. 深渊宁静 (Abyss)

- **风格**: 暗色专注系 — 深海般的沉静与专注
- **情感**: 适合深度学习、夜间使用，营造"沉浸其中"的感觉
- **背景**: 不使用照片，纯 Canvas 生成
- **色板**:
  - background: `#06080e` (近乎纯黑的深蓝)
  - surface: `#0e1420` (深蓝灰)
  - surfaceLight: `#1a2238` (蓝灰)
  - primary: `#38bdf8` (天蓝)
  - primaryLight: `#7dd3fc` (浅蓝)
  - accent: `#06b6d4` (青色)
  - textPrimary: `#e8f0f8` (冷白)
  - textSecondary: `#8aacc0` (蓝灰文字)
  - textMuted: `#4a6a80` (暗蓝灰)
  - border: `#1a2238`
  - auraStyle: `radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.08) 0%, transparent 70%)`
- **Canvas 动效**:
  - 无背景图，纯 Canvas 绘制
  - 深蓝色渐变底色
  - 缓慢漂浮的光点（模拟深海微生物发光）— 30 个，大小不一，亮度呼吸
  - 偶尔出现的光柱（从上方射下的微弱光束）— 2-3 个，极慢旋转
  - 整体效果：黑暗中飘浮着微弱的光点，偶尔有光束从上方透下来
- **网格**: 无（纯粒子效果，不需要网格扭曲）

### 2. 暖沙书房 (Study)

- **风格**: 温暖中性系 — 像老旧书房一样温暖安心
- **情感**: 适合长时间阅读、笔记整理，温暖而不刺眼
- **背景**: 不使用照片，Canvas 生成微妙纹理
- **色板**:
  - background: `#1a1510` (深棕黑)
  - surface: `#2a2318` (暖棕)
  - surfaceLight: `#3a3228` (浅暖棕)
  - primary: `#d4a054` (琥珀金)
  - primaryLight: `#e8c08a` (浅琥珀)
  - accent: `#c07830` (铜色)
  - textPrimary: `#f0e8d8` (暖白)
  - textSecondary: `#b0a088` (暖灰文字)
  - textMuted: `#7a6a58` (暗暖灰)
  - border: `#3a3228`
  - auraStyle: `radial-gradient(ellipse at 30% 50%, rgba(212,160,84,0.06) 0%, transparent 70%)`
- **Canvas 动效**:
  - 无背景图，Canvas 绘制暖色渐变底色
  - 微妙的"灰尘粒子"在暖光中缓缓飘浮 — 20 个，金色，极小（1-2px）
  - 2-3 个柔和的暖色光晕在画面中极慢地脉动（呼吸效果）
  - 整体效果：像阳光穿过老旧书房的窗户，金色灰尘在光柱中飘浮
- **网格**: 无（纯粒子 + 光晕效果）

### 3. 极光冰原 (Aurora)

- **风格**: 自然风景 + 抽象科技 — 极光下的冰原
- **情感**: 壮丽而冷静，最有视觉冲击力的"签名主题"
- **背景**: 使用一张极光照片，Canvas 做网格化极光波动
- **色板**:
  - background: `#040810` (极夜黑)
  - surface: `#0a1428` (深冰蓝)
  - surfaceLight: `#142040` (冰蓝)
  - primary: `#34d399` (极光绿)
  - primaryLight: `#6ee7b7` (浅极光绿)
  - accent: `#818cf8` (极光紫)
  - textPrimary: `#e8f4f0` (冷绿白)
  - textSecondary: `#80b8a8` (绿灰文字)
  - textMuted: `#407068` (暗绿灰)
  - border: `#142040`
  - auraStyle: `radial-gradient(ellipse at 50% 20%, rgba(52,211,153,0.1) 0%, transparent 60%)`
- **Canvas 动效**:
  - 极光照片背景，20×14 网格化极光波动效果（网格整体缓慢起伏，模拟极光飘动）
  - 飘落的冰晶粒子 — 25 个，六角形（用 Canvas path 绘制），缓慢旋转下落
  - 偶尔闪烁的星点 — 40 个，白/浅绿色
  - 极光色彩叠加：在网格之上绘制一层半透明的渐变色带，模拟极光的光幕效果
- **网格**: 20×14，极光波动偏移（与现有 ocean 类似但更缓慢、更大幅）

## 技术实现

### 文件变更

**删除**:
- `components/themes/OceanBg.tsx`
- `components/themes/ForestBg.tsx`
- `components/themes/HopeBg.tsx`
- `components/themes/PinkBg.tsx`
- `components/themes/InkBg.tsx`
- `components/themes/CosmicBg.tsx`
- `public/images/themes/ocean-bg.jpg`
- `public/images/themes/forest-bg.jpg`
- `public/images/themes/hope-bg.jpg`
- `public/images/themes/pink-bg.jpg`
- `public/images/themes/ink-bg.jpg`
- `public/images/themes/cosmic-bg.jpg`

**新建**:
- `components/themes/AbyssBg.tsx` — 深渊宁静背景
- `components/themes/StudyBg.tsx` — 暖沙书房背景
- `components/themes/AuroraBg.tsx` — 极光冰原背景
- `public/images/themes/aurora-bg.jpg` — 极光照片（需生成或下载）

**修改**:
- `lib/themeConfig.ts` — 替换主题定义为 3 个新主题
- `components/ThemeProvider.tsx` — 更新 bgComponentMap
- `components/ThemeSwitcher.tsx` — 更新图标和主题选择 UI
- `app/globals.css` — 更新 :root 默认值为 Abyss 主题

### 架构要点

1. Abyss 和 Study 不使用背景图（纯 Canvas），Aurora 使用一张极光照片
2. 所有 3 个主题都使用 `willChange: 'transform'` 的 Canvas 元素
3. 主题切换过渡保持 600ms cubic-bezier crossfade
4. `particleColor` 保留用于可能的扩展
5. 保留 `applyThemeToDOM()` + CSS 变量系统
6. 保留 `localStorage` 主题记忆

### 过渡期兼容

- 旧的 localStorage key `km-theme-id` 保留
- 如果用户存储了旧主题 ID（如 'ocean'），fallback 到 'abyss'
- ThemeProvider 中的 `getBgComponent()` 的 fallback 也改为 Abyss
