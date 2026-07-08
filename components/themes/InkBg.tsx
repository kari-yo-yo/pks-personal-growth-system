'use client';

import PhotorealBg from './PhotorealBg';

export default function InkBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // 淡墨色晕染圆/云块 — 模拟云雾缓慢扩散
    for (let i = 0; i < 12; i++) {
      const seed = i * 197.3;
      const cx = (seed * 0.57 + Math.sin(t * 0.06 + seed) * 60) % (w + 200) - 100;
      const cy = (seed * 0.33 + Math.cos(t * 0.04 + seed) * 40) % (h + 100) - 50;
      const life = Math.sin(t * 0.15 + seed) * 0.5 + 0.5;
      const r = 40 + life * 80;
      const alpha = life * 0.06;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(120, 120, 120, ${alpha})`);
      grad.addColorStop(0.6, `rgba(100, 100, 100, ${alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(100, 100, 100, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 极淡的白色雾气条带 — 模拟瀑布水雾
    for (let i = 0; i < 3; i++) {
      const seed = i * 317.1;
      const baseY = h * (0.3 + i * 0.2);
      const alpha = 0.02 + Math.sin(t * 0.2 + seed) * 0.01;

      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 8) {
        ctx.lineTo(x, baseY + Math.sin(x * 0.003 + t * 0.15 + seed) * 20);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, baseY - 40, 0, baseY + 80);
      grad.addColorStop(0, 'rgba(200, 200, 200, 0)');
      grad.addColorStop(0.5, `rgba(220, 220, 220, ${alpha})`);
      grad.addColorStop(1, 'rgba(220, 220, 220, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // 水面涟漪圈 — 偶尔扩散的同心圆
    for (let i = 0; i < 4; i++) {
      const seed = i * 457.3;
      const cycle = 10 + (seed % 6);
      const phase = (t + seed * 0.2) % cycle;
      if (phase > 6) continue;

      const progress = phase / 6;
      const cx = (seed * 0.37) % w;
      const cy = h * (0.6 + (seed % 30) * 0.01);
      const maxR = 30 + (seed % 50);
      const r = progress * maxR;
      const alpha = (1 - progress) * 0.08;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 180, 180, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 远山轮廓的淡墨影 — 缓慢移动
    for (let i = 0; i < 2; i++) {
      const seed = i * 617.1;
      const offsetX = Math.sin(t * 0.03 + seed) * 20;
      const alpha = 0.04 + Math.sin(t * 0.1 + seed) * 0.015;
      const y = h * (0.55 + i * 0.08);

      ctx.beginPath();
      ctx.moveTo(-50 + offsetX, h);
      ctx.lineTo(-50 + offsetX, y);
      for (let x = 0; x <= w + 100; x += 30) {
        ctx.lineTo(x - 50 + offsetX, y - Math.abs(Math.sin(x * 0.01 + seed)) * 30);
      }
      ctx.lineTo(w + 50 + offsetX, h);
      ctx.closePath();
      ctx.fillStyle = `rgba(80, 80, 80, ${alpha})`;
      ctx.fill();
    }
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/ink-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 50% 30%, #1a1a15 0%, #0a0a08 100%)"
      drawEffect={draw}
      overlayOpacity={0.5}
      blendMode="soft-light"
    />
  );
}
