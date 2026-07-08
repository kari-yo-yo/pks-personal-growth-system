'use client';

import PhotorealBg from './PhotorealBg';
import {
  drawSoftGlow,
  breathe,
  noise2D,
  clamp,
} from '@/lib/themeUtils';

export default function HopeBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // Light source position (sun is in top-right of the image)
    const sunX = w * 0.75;
    const sunY = h * 0.15;

    // === 1. 光芒脉动 — 从光源向四周缓慢扩散的柔光 ===
    const pulseAlpha = breathe(t, 8, 0.08, 0.18);
    const glowRadius = Math.max(w, h) * 0.6 + Math.sin(t * 0.4) * 50;

    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowRadius);
    sunGrad.addColorStop(0, `rgba(255, 230, 180, ${pulseAlpha})`);
    sunGrad.addColorStop(0.2, `rgba(255, 210, 150, ${pulseAlpha * 0.6})`);
    sunGrad.addColorStop(0.5, `rgba(255, 190, 120, ${pulseAlpha * 0.25})`);
    sunGrad.addColorStop(1, `rgba(255, 180, 100, 0)`);

    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // Secondary warm halo
    const haloAlpha = breathe(t, 10, 0.04, 0.1);
    const haloGrad = ctx.createRadialGradient(
      w * 0.5, h * 0.4, 0,
      w * 0.5, h * 0.4, Math.max(w, h) * 0.8
    );
    haloGrad.addColorStop(0, `rgba(255, 200, 140, 0)`);
    haloGrad.addColorStop(0.4, `rgba(255, 190, 130, ${haloAlpha * 0.3})`);
    haloGrad.addColorStop(0.7, `rgba(255, 180, 120, ${haloAlpha})`);
    haloGrad.addColorStop(1, `rgba(255, 170, 110, 0)`);
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, w, h);

    // === 2. 光尘微粒子 — 18个金色微粒，在光柱中悬浮飘动 ===
    const dustCount = 18;
    for (let i = 0; i < dustCount; i++) {
      const seed = i * 183.5;
      const angle = seed * 0.1;
      const dist = (seed % 100) * 0.01 * Math.max(w, h) * 0.4;

      const dx = Math.cos(angle + t * 0.05) * dist;
      const dy = Math.sin(angle + t * 0.03) * dist;
      const px = sunX + dx + Math.sin(t * 0.2 + seed) * 30;
      const py = sunY + dy + Math.cos(t * 0.15 + seed) * 20 + t * 2;

      const wrapY = py % (h + 20) - 10;
      const size = 1 + (seed % 2.5);
      const flicker = Math.sin(t * 1.5 + seed) * 0.5 + 0.5;
      const alpha = (0.3 + flicker * 0.5) * clamp(1 - Math.abs(wrapY - h * 0.5) / (h * 0.5), 0, 1);

      ctx.save();
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(255, 220, 150, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(px, wrapY, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 235, 200, ${alpha})`;
      ctx.fill();
      ctx.restore();
    }

    // === 3. 温暖光晕 — 画面边缘有暖色光晕（极淡） ===
    const edgeAlpha = breathe(t, 14, 0.03, 0.07);
    const edgeGrad = ctx.createRadialGradient(
      w * 0.5, h * 0.5, Math.max(w, h) * 0.3,
      w * 0.5, h * 0.5, Math.max(w, h) * 0.9
    );
    edgeGrad.addColorStop(0, `rgba(255, 200, 120, 0)`);
    edgeGrad.addColorStop(0.6, `rgba(255, 190, 110, 0)`);
    edgeGrad.addColorStop(1, `rgba(255, 180, 100, ${edgeAlpha})`);
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);

    // === 4. 柔和光束 ===
    for (let i = 0; i < 4; i++) {
      const seed = i * 251.3;
      const beamAngle = (Math.PI * 0.15) + (i * 0.08) + Math.sin(t * 0.2 + seed) * 0.03;
      const beamLen = Math.max(w, h) * 0.8;
      const x2 = sunX + Math.cos(beamAngle) * beamLen;
      const y2 = sunY + Math.sin(beamAngle) * beamLen;
      const beamAlpha = 0.03 + Math.sin(t * 0.35 + seed) * 0.015;
      const beamWidth = 25 + Math.sin(t * 0.25 + seed) * 10;

      const grad = ctx.createLinearGradient(sunX, sunY, x2, y2);
      grad.addColorStop(0, `rgba(255, 230, 180, ${beamAlpha})`);
      grad.addColorStop(0.5, `rgba(255, 220, 170, ${beamAlpha * 0.5})`);
      grad.addColorStop(1, `rgba(255, 210, 160, 0)`);

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = beamWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/hope-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 70% 20%, #3a2a10 0%, #1a1208 100%)"
      drawEffect={draw}
      overlayOpacity={0.5}
      blendMode="screen"
      breathing={{
        period: 8,
        minBrightness: 0.95,
        maxBrightness: 1.08,
        minSaturate: 0.92,
        maxSaturate: 1.08,
      }}
      darkOverlay={0.32}
    />
  );
}
