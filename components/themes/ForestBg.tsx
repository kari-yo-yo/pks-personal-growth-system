'use client';

import PhotorealBg from './PhotorealBg';

export default function ForestBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // 树冠缝隙透下的光斑（God rays / dappled light）
    for (let i = 0; i < 18; i++) {
      const seed = i * 173.3;
      const cx = (seed * 0.71 + Math.sin(t * 0.15 + seed) * 40) % (w + 100) - 50;
      const cy = (seed * 0.31) % (h * 0.7) + h * 0.05;
      const life = Math.sin(t * 0.4 + seed) * 0.5 + 0.5;
      const r = 15 + life * 30;
      const alpha = life * 0.12;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 220, 150, ${alpha})`;
      ctx.fill();
    }

    // 光柱（垂直的半透明光束）
    for (let i = 0; i < 4; i++) {
      const seed = i * 347.1;
      const x = (seed * 0.51 + Math.sin(t * 0.08 + seed) * 60) % w;
      const beamW = 30 + (seed % 40);
      const alpha = 0.03 + Math.sin(t * 0.3 + seed) * 0.015;

      const grad = ctx.createLinearGradient(x, 0, x + beamW * 0.3, h * 0.7);
      grad.addColorStop(0, `rgba(200, 235, 180, ${alpha})`);
      grad.addColorStop(0.5, `rgba(180, 220, 150, ${alpha * 0.6})`);
      grad.addColorStop(1, `rgba(180, 220, 150, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(x - beamW / 2, 0, beamW, h * 0.7);
    }

    // 极细的灰尘/花粉粒子在光柱中飘动
    for (let i = 0; i < 40; i++) {
      const seed = i * 97.3;
      const px = (seed * 0.41 + Math.sin(t * 0.2 + seed) * 20 + t * 8) % (w + 50) - 25;
      const py = (seed * 0.23 + Math.cos(t * 0.15 + seed) * 30 + t * 5) % h;
      const alpha = 0.15 + Math.sin(t + seed) * 0.1;
      ctx.beginPath();
      ctx.arc(px, py, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 240, 200, ${alpha})`;
      ctx.fill();
    }

    // 偶尔飘落的单片叶子（每片有生命周期）
    for (let i = 0; i < 6; i++) {
      const seed = i * 541.7;
      const cycle = 12 + (seed % 8);
      const phase = (t + seed * 0.1) % cycle;
      if (phase > 8) continue; // 叶子存在 8 秒后消失

      const progress = phase / 8;
      const lx = (seed * 0.31 + Math.sin(t * 0.5 + seed) * 80) % w;
      const ly = -20 + progress * (h + 40);
      const rot = t * 0.8 + seed;
      const alpha = 0.5 * (1 - progress * progress);

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160, 200, 120, ${alpha})`;
      ctx.fill();
      ctx.restore();
    }
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/forest-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 50% 0%, #1a3a1a 0%, #0a140a 100%)"
      drawEffect={draw}
      overlayOpacity={0.6}
      blendMode="overlay"
    />
  );
}
