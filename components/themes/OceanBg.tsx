'use client';

import PhotorealBg from './PhotorealBg';

export default function OceanBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // 海面光斑 — 模拟阳光在海面上的闪烁反射
    for (let i = 0; i < 30; i++) {
      const seed = i * 137.5;
      const bx = ((seed * 0.618 + t * 12) % (w + 200)) - 100;
      const by = h * 0.4 + Math.sin(seed + t * 0.3) * h * 0.25 + (seed % (h * 0.3));
      const life = Math.sin(t * 1.5 + seed) * 0.5 + 0.5;
      const size = 2 + life * 6;
      const alpha = life * 0.35;

      ctx.beginPath();
      ctx.ellipse(bx, by, size * 2.5, size * 0.6, Math.PI * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 230, 255, ${alpha})`;
      ctx.fill();
    }

    // 远处水平波纹线
    for (let i = 0; i < 5; i++) {
      const y = h * (0.3 + i * 0.12);
      ctx.beginPath();
      const waveAlpha = 0.08 - i * 0.012;
      ctx.strokeStyle = `rgba(140, 210, 240, ${Math.max(0, waveAlpha)})`;
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= w; x += 4) {
        const waveY = y + Math.sin(x * 0.008 + t * 0.5 + i) * 3;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }

    // 缓慢上升的细小气泡（深海感）
    for (let i = 0; i < 15; i++) {
      const seed = i * 293.7;
      const bx = (seed * 0.37 + Math.sin(t * 0.1 + seed) * 30) % w;
      const by = h - ((t * 15 + seed * 20) % (h * 0.6));
      const r = 1 + (seed % 3);
      const alpha = 0.15 * (1 - by / h);
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 240, 255, ${alpha})`;
      ctx.fill();
    }
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/ocean-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 50% 60%, #0a2a3a 0%, #051018 100%)"
      drawEffect={draw}
      overlayOpacity={0.7}
      blendMode="screen"
    />
  );
}
