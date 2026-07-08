'use client';

import PhotorealBg from './PhotorealBg';
import { assetPath } from '@/lib/config';
import {
  drawPetal,
  drawSoftGlow,
  bezierCubic,
  breathe,
  clamp,
} from '@/lib/themeUtils';

interface FallingPetal {
  seed: number;
  startX: number;
  startY: number;
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
  endX: number;
  endY: number;
  size: number;
  color: { r: number; g: number; b: number };
  cycle: number;
  rotationSpeed: number;
  tiltSpeed: number;
}

export default function PinkBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // === 1. 粉色柔光 — 画面中轻微的粉色柔光浮动 ===
    const softAlpha = breathe(t, 12, 0.04, 0.09);
    const softGrad = ctx.createRadialGradient(
      w * 0.4, h * 0.35, 0,
      w * 0.4, h * 0.35, Math.max(w, h) * 0.7
    );
    softGrad.addColorStop(0, `rgba(255, 180, 210, ${softAlpha})`);
    softGrad.addColorStop(0.4, `rgba(255, 170, 200, ${softAlpha * 0.5})`);
    softGrad.addColorStop(1, `rgba(255, 160, 190, 0)`);
    ctx.fillStyle = softGrad;
    ctx.fillRect(0, 0, w, h);

    // Secondary warm glow from the archway
    const archAlpha = breathe(t, 9, 0.03, 0.07);
    const archGrad = ctx.createRadialGradient(
      w * 0.5, h * 0.6, 0,
      w * 0.5, h * 0.6, w * 0.4
    );
    archGrad.addColorStop(0, `rgba(255, 220, 180, ${archAlpha})`);
    archGrad.addColorStop(1, `rgba(255, 210, 170, 0)`);
    ctx.fillStyle = archGrad;
    ctx.fillRect(0, 0, w, h);

    // === 2. 花瓣飘落 — 最多12片，贝塞尔曲线风轨迹，3D旋转 ===
    const petalCount = 12;
    for (let i = 0; i < petalCount; i++) {
      const seed = i * 317.3;
      const cycle = 10 + (seed % 8); // 10-18s per petal
      const phase = (t + seed * 0.3) % cycle;
      const progress = phase / cycle;

      // Start from upper area (where flowers would be)
      const startX = (seed * 0.41) % (w * 0.8) + w * 0.1;
      const startY = -15;
      const endX = startX + Math.sin(seed * 1.7) * w * 0.3;
      const endY = h + 15;

      // Bezier control points create wind trajectory
      const windStrength = Math.sin(t * 0.15 + seed) * w * 0.15;
      const cp1x = startX + windStrength;
      const cp1y = startY + h * 0.35;
      const cp2x = endX - windStrength * 0.5;
      const cp2y = endY - h * 0.35;

      const px = bezierCubic(progress, startX, cp1x, cp2x, endX);
      const py = bezierCubic(progress, startY, cp1y, cp2y, endY);

      // 3D rotation
      const rotation = progress * Math.PI * 4 + seed;
      const tilt = Math.sin(progress * Math.PI * 3 + seed) * Math.PI * 0.4;

      // Size and alpha
      const size = 6 + (seed % 5);
      const alpha = (0.8 - progress * 0.5) * Math.sin(progress * Math.PI) * 1.5;

      // Color variation
      const colors = [
        { r: 255, g: 182, b: 193 },
        { r: 255, g: 192, b: 203 },
        { r: 255, g: 160, b: 180 },
        { r: 255, g: 200, b: 210 },
      ];
      const color = colors[i % colors.length];

      if (alpha > 0.02) {
        drawPetal(ctx, px, py, size * 0.6, size, rotation, tilt, color, clamp(alpha, 0, 0.8));
      }
    }

    // === 3. 光影呼吸 — 整体画面亮度/饱和度变化由 PhotorealBg 处理 ===
    // 这里添加额外的光斑闪烁
    for (let i = 0; i < 8; i++) {
      const seed = i * 193.7;
      const sx = (seed * 0.51) % w;
      const sy = (seed * 0.31) % h;
      const flicker = Math.sin(t * 0.6 + seed) * 0.5 + 0.5;
      const sAlpha = flicker * 0.06;
      const radius = 15 + (seed % 25);

      drawSoftGlow(ctx, sx, sy, radius, 255, 190, 210, sAlpha);
    }

    // === 4. 极细花粉粒子 ===
    for (let i = 0; i < 15; i++) {
      const seed = i * 227.1;
      const px = (seed * 0.37 + Math.sin(t * 0.1 + seed) * 20) % (w + 30) - 15;
      const py = (seed * 0.29 + t * 1.5 + Math.cos(t * 0.08 + seed) * 15) % h;
      const pAlpha = 0.1 + Math.sin(t * 0.7 + seed) * 0.05;

      ctx.save();
      ctx.shadowBlur = 3;
      ctx.shadowColor = `rgba(255, 200, 220, ${pAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(px, py, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 235, ${pAlpha})`;
      ctx.fill();
      ctx.restore();
    }
  };

  return (
    <PhotorealBg
      imageSrc={assetPath('/images/themes/pink-bg.jpg')}
      fallbackGradient="radial-gradient(ellipse at 50% 50%, #3a2a30 0%, #1a1018 100%)"
      drawEffect={draw}
      overlayOpacity={0.5}
      blendMode="screen"
      breathing={{
        period: 12,
        minBrightness: 0.95,
        maxBrightness: 1.05,
        minSaturate: 0.94,
        maxSaturate: 1.06,
      }}
      darkOverlay={0.36}
    />
  );
}
