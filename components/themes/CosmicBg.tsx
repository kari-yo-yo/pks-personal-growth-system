'use client';

import PhotorealBg from './PhotorealBg';
import {
  drawStar,
  drawShootingStar,
  breathe,
  clamp,
} from '@/lib/themeUtils';
import type { ShootingStar as ShootingStarType } from '@/lib/themeUtils';

interface StarData {
  x: number;
  y: number;
  baseRadius: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: { r: number; g: number; b: number };
}

export default function CosmicBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // === 1. 银河脉动 — 银河光带 subtle breathing ===
    const galaxyAlpha = breathe(t, 15, 0.06, 0.12);

    // Milky way band - diagonal from top-left to bottom-right
    const galaxyGrad = ctx.createLinearGradient(0, 0, w, h * 0.7);
    galaxyGrad.addColorStop(0, `rgba(200, 180, 220, 0)`);
    galaxyGrad.addColorStop(0.2, `rgba(210, 190, 230, ${galaxyAlpha * 0.3})`);
    galaxyGrad.addColorStop(0.4, `rgba(220, 200, 240, ${galaxyAlpha})`);
    galaxyGrad.addColorStop(0.6, `rgba(210, 190, 230, ${galaxyAlpha * 0.7})`);
    galaxyGrad.addColorStop(0.8, `rgba(200, 180, 220, ${galaxyAlpha * 0.3})`);
    galaxyGrad.addColorStop(1, `rgba(190, 170, 210, 0)`);

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = galaxyGrad;
    ctx.fillRect(0, 0, w, h * 0.8);
    ctx.restore();

    // === 2. 星星闪烁 — 100颗星星，各有不同的闪烁频率 ===
    const starCount = 100;
    for (let i = 0; i < starCount; i++) {
      const seed = i * 137.5;
      const sx = (seed * 0.71) % w;
      const sy = (seed * 0.53) % (h * 0.85);
      const baseRadius = 0.5 + (seed % 2.5);
      const twinkleSpeed = 0.5 + (seed % 3);
      const twinkleOffset = seed * 0.1;

      const colors = [
        { r: 255, g: 250, b: 240 },
        { r: 220, g: 230, b: 255 },
        { r: 255, g: 240, b: 220 },
        { r: 240, g: 220, b: 255 },
      ];
      const color = colors[i % colors.length];

      drawStar(ctx, sx, sy, baseRadius, t * twinkleSpeed + twinkleOffset, color);
    }

    // === 3. 流星 ===
    // Shooting star 1
    const shootingStarCycle1 = 20;
    const ssPhase1 = t % shootingStarCycle1;
    if (ssPhase1 > 1 && ssPhase1 < 4) {
      const ssProgress = (ssPhase1 - 1) / 3;
      const ssX = w * 0.8 - ssProgress * w * 0.6;
      const ssY = h * 0.15 + ssProgress * h * 0.25;
      const ssAlpha = Math.sin(ssProgress * Math.PI) * 0.9;

      const star1: ShootingStarType = {
        x: ssX,
        y: ssY,
        vx: -120,
        vy: 50,
        life: ssAlpha * 3,
        maxLife: 3,
        length: 40 + ssAlpha * 30,
      };
      drawShootingStar(ctx, star1, { r: 255, g: 255, b: 240 });
    }

    // Shooting star 2 (less frequent)
    const shootingStarCycle2 = 35;
    const ssPhase2 = (t + 12) % shootingStarCycle2;
    if (ssPhase2 > 1 && ssPhase2 < 3.5) {
      const ssProgress = (ssPhase2 - 1) / 2.5;
      const ssX = w * 0.6 - ssProgress * w * 0.4;
      const ssY = h * 0.1 + ssProgress * h * 0.2;
      const ssAlpha = Math.sin(ssProgress * Math.PI) * 0.7;

      const star2: ShootingStarType = {
        x: ssX,
        y: ssY,
        vx: -100,
        vy: 40,
        life: ssAlpha * 2.5,
        maxLife: 2.5,
        length: 30 + ssAlpha * 25,
      };
      drawShootingStar(ctx, star2, { r: 220, g: 230, b: 255 });
    }

    // === 4. 星云光晕 ===
    const nebulaAlpha = breathe(t, 18, 0.03, 0.06);
    const nebulaGrad = ctx.createRadialGradient(
      w * 0.3, h * 0.25, 0,
      w * 0.3, h * 0.25, w * 0.5
    );
    nebulaGrad.addColorStop(0, `rgba(180, 160, 220, ${nebulaAlpha})`);
    nebulaGrad.addColorStop(0.5, `rgba(160, 140, 200, ${nebulaAlpha * 0.5})`);
    nebulaGrad.addColorStop(1, `rgba(140, 120, 180, 0)`);
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, w, h);

    // Second nebula region
    const nebula2Alpha = breathe(t + 5, 20, 0.02, 0.05);
    const nebula2Grad = ctx.createRadialGradient(
      w * 0.75, h * 0.3, 0,
      w * 0.75, h * 0.3, w * 0.4
    );
    nebula2Grad.addColorStop(0, `rgba(200, 180, 160, ${nebula2Alpha})`);
    nebula2Grad.addColorStop(1, `rgba(180, 160, 140, 0)`);
    ctx.fillStyle = nebula2Grad;
    ctx.fillRect(0, 0, w, h);

    // === 5. 雪山反光 — 山脚下微妙的星光反射 ===
    const reflectAlpha = breathe(t, 10, 0.02, 0.04);
    for (let i = 0; i < 15; i++) {
      const seed = i * 293.1;
      const rx = (seed * 0.37) % w;
      const ry = h * 0.78 + (seed % 1) * h * 0.15;
      const rAlpha = reflectAlpha * (0.5 + Math.sin(t * 0.8 + seed) * 0.5);

      ctx.beginPath();
      ctx.arc(rx, ry, 1 + (seed % 2), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 210, 230, ${rAlpha})`;
      ctx.fill();
    }
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/cosmic-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 50% 20%, #0e0e24 0%, #050510 100%)"
      drawEffect={draw}
      overlayOpacity={0.6}
      blendMode="screen"
      breathing={{
        period: 15,
        minBrightness: 0.96,
        maxBrightness: 1.04,
      }}
      darkOverlay={0.3}
    />
  );
}
