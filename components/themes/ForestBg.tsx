'use client';

import PhotorealBg from './PhotorealBg';
import {
  drawDappledSpot,
  drawMistLayer,
  drawBird,
  noise2D,
  organicSine,
  clamp,
} from '@/lib/themeUtils';

export default function ForestBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // === 1. 光斑晃动 — 不规则的「阳光穿过树叶」形状 ===
    const spotCount = 8;
    for (let i = 0; i < spotCount; i++) {
      const seed = i * 173.3;
      // Slow organic movement using noise
      const nx = noise2D(t * 0.08 + seed, 0);
      const ny = noise2D(0, t * 0.06 + seed);

      const cx = (seed * 0.71 + nx * w * 0.15) % (w + 100) - 50;
      const cy = (seed * 0.31 + ny * h * 0.1) % (h * 0.6) + h * 0.05;

      const life = Math.sin(t * 0.35 + seed) * 0.5 + 0.5;
      const baseRadius = 20 + life * 35;
      const alpha = life * 0.1;

      drawDappledSpot(
        ctx,
        cx,
        cy,
        baseRadius,
        { r: 200, g: 235, b: 160 },
        alpha,
        0.35
      );
    }

    // === 2. 林间薄雾 — 极淡的雾气缓慢流动 ===
    drawMistLayer(ctx, w, h, t, h * 0.3, 0.03, { r: 180, g: 210, b: 160 }, 0.04);
    drawMistLayer(ctx, w, h, t + 15, h * 0.5, 0.025, { r: 160, g: 200, b: 150 }, 0.03);

    // === 3. 叶片颤动 — 在树冠区域（画面上半部）叠加微动效 ===
    const leafCount = 12;
    for (let i = 0; i < leafCount; i++) {
      const seed = i * 241.7;
      const lx = (seed * 0.51) % w;
      const ly = (seed * 0.23) % (h * 0.55);

      // Only in canopy area (upper 55%)
      if (ly > h * 0.55) continue;

      const trembleX = organicSine(t + seed, [0.7, 1.3, 2.1], [1.5, 0.8, 0.4]);
      const trembleY = organicSine(t + seed + 10, [0.6, 1.1, 1.8], [1.2, 0.7, 0.3]);
      const leafAlpha = 0.06 + Math.sin(t * 0.4 + seed) * 0.03;
      const leafSize = 4 + (seed % 4);

      ctx.save();
      ctx.translate(lx + trembleX, ly + trembleY);
      ctx.rotate(Math.sin(t * 0.5 + seed) * 0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, leafSize, leafSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(140, 190, 100, ${leafAlpha})`;
      ctx.fill();
      ctx.restore();
    }

    // === 4. 飞鸟剪影 — 偶尔掠过，极小极淡 ===
    const birdCycle = 28;
    const birdPhase = t % birdCycle;
    if (birdPhase > 2 && birdPhase < 18) {
      const birdProgress = (birdPhase - 2) / 16;
      const birdX = w * 1.05 - birdProgress * w * 1.15;
      const birdY = h * 0.12 + Math.sin(birdProgress * Math.PI) * h * 0.06;
      const birdAlpha = Math.sin(birdProgress * Math.PI) * 0.15;
      const wingPhase = t * 3.5;

      // Draw 2 birds in formation
      drawBird(ctx, birdX, birdY, 0.8, wingPhase, birdAlpha);
      drawBird(ctx, birdX + 18, birdY + 6, 0.65, wingPhase + 0.5, birdAlpha * 0.8);
      drawBird(ctx, birdX - 12, birdY + 10, 0.55, wingPhase + 1.0, birdAlpha * 0.6);
    }

    // === 5. 极细花粉/灰尘在光柱中飘动 ===
    for (let i = 0; i < 25; i++) {
      const seed = i * 97.3;
      const px = (seed * 0.41 + Math.sin(t * 0.15 + seed) * 25 + t * 4) % (w + 40) - 20;
      const py = (seed * 0.23 + Math.cos(t * 0.12 + seed) * 20 + t * 2.5) % h;
      const pAlpha = 0.1 + Math.sin(t * 0.8 + seed) * 0.06;

      ctx.beginPath();
      ctx.arc(px, py, 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 245, 200, ${pAlpha})`;
      ctx.fill();
    }
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/forest-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 50% 0%, #1a3a1a 0%, #0a140a 100%)"
      drawEffect={draw}
      overlayOpacity={0.5}
      blendMode="overlay"
      breathing={{
        period: 12,
        minBrightness: 0.96,
        maxBrightness: 1.04,
      }}
      darkOverlay={0.38}
    />
  );
}
