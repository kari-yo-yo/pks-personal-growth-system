'use client';

import PhotorealBg from './PhotorealBg';
import {
  drawLightShaft,
  drawBubble,
  drawWhaleSilhouette,
  breathe,
  bezierCubic,
  noise2D,
  clamp,
} from '@/lib/themeUtils';

export default function OceanBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // === 1. 海水涌动 — 全画面柔和光晕呼吸 ===
    const breatheAlpha = breathe(t, 10, 0.03, 0.07);
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
    grad.addColorStop(0, `rgba(80, 200, 220, ${breatheAlpha})`);
    grad.addColorStop(0.5, `rgba(60, 180, 210, ${breatheAlpha * 0.5})`);
    grad.addColorStop(1, `rgba(40, 160, 200, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // === 2. 透射光柱 — 从上方光源射入，有体积感，缓慢摆动 ===
    const shaftCount = 3;
    for (let i = 0; i < shaftCount; i++) {
      const seed = i * 137.5;
      const baseX = w * (0.25 + i * 0.25);
      const sway = Math.sin(t * 0.4 + seed) * w * 0.08;
      const x1 = baseX + sway;
      const y1 = -20;
      const x2 = baseX + sway * 0.3 + Math.sin(t * 0.25 + seed) * w * 0.05;
      const y2 = h * 0.75;
      const width = 40 + Math.sin(t * 0.3 + seed) * 15;
      const alpha = 0.06 + Math.sin(t * 0.5 + seed) * 0.02;

      drawLightShaft(ctx, x1, y1, x2, y2, width, '#a8e6f0', alpha);
    }

    // === 3. 气泡 — 不超过8个，半透明，高光反射，独特曲线上升 ===
    const bubbleCount = 8;
    for (let i = 0; i < bubbleCount; i++) {
      const seed = i * 293.7;
      const cycle = 18 + (seed % 12); // 18-30s cycle
      const phase = (t + seed * 0.5) % cycle;
      const progress = phase / cycle;

      // Bezier curve path for each bubble
      const startX = (seed * 0.37) % w;
      const cp1x = startX + Math.sin(seed * 1.3) * w * 0.15;
      const cp2x = startX + Math.cos(seed * 0.7) * w * 0.1;
      const endX = startX + Math.sin(seed * 2.1) * w * 0.08;

      const bx = bezierCubic(progress, startX, cp1x, cp2x, endX);
      const by = h - progress * h * 0.7;

      // Only draw if within visible area
      if (by < -20 || by > h + 20) continue;

      const radius = 3 + (seed % 5); // 3-8px
      const alpha = 0.4 * (1 - progress * 0.3) * (0.7 + Math.sin(t * 2 + seed) * 0.3);

      drawBubble(ctx, bx, by, radius, clamp(alpha, 0, 1));
    }

    // === 4. 神秘鲸鱼剪影 — 偶尔出现，极淡 ===
    const whaleCycle = 45; // every 45s
    const whalePhase = t % whaleCycle;
    if (whalePhase > 5 && whalePhase < 35) {
      const whaleProgress = (whalePhase - 5) / 30;
      const whaleX = w * 1.1 - whaleProgress * w * 1.3;
      const whaleY = h * 0.55 + Math.sin(whaleProgress * Math.PI * 2) * h * 0.05;
      const whaleAlpha = Math.sin(whaleProgress * Math.PI) * 0.12;
      const scale = 0.8 + Math.sin(t * 0.1) * 0.1;

      drawWhaleSilhouette(ctx, whaleX, whaleY, scale, whaleAlpha);
    }

    // === 5. 水下微粒 — 极细的光尘 ===
    for (let i = 0; i < 20; i++) {
      const seed = i * 157.3;
      const px = (seed * 0.41 + Math.sin(t * 0.08 + seed) * 30) % (w + 60) - 30;
      const py = (seed * 0.23 + t * 3 + Math.sin(t * 0.12 + seed) * 20) % h;
      const pAlpha = 0.08 + Math.sin(t * 0.5 + seed) * 0.04;
      const size = 0.5 + (seed % 1.5);

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 235, 255, ${pAlpha})`;
      ctx.fill();
    }
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/ocean-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 50% 60%, #0a2a3a 0%, #051018 100%)"
      drawEffect={draw}
      overlayOpacity={0.55}
      blendMode="screen"
      breathing={{
        period: 10,
        minBrightness: 0.94,
        maxBrightness: 1.06,
        minSaturate: 0.95,
        maxSaturate: 1.05,
      }}
      darkOverlay={0.35}
    />
  );
}
