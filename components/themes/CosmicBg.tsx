'use client';

import PhotorealBg from './PhotorealBg';

export default function CosmicBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // 星星闪烁 — 大量小白点，不同亮度周期闪烁
    for (let i = 0; i < 150; i++) {
      const seed = i * 137.3;
      const sx = (seed * 0.71) % w;
      const sy = (seed * 0.53) % h;
      const twinkle = Math.sin(t * (1 + (seed % 3)) + seed) * 0.5 + 0.5;
      const baseAlpha = 0.2 + (seed % 40) * 0.015;
      const alpha = baseAlpha + twinkle * 0.5;
      const r = 0.5 + (seed % 3) * 0.3;

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha, 1)})`;
      ctx.fill();
    }

    // 几颗较亮的恒星
    for (let i = 0; i < 8; i++) {
      const seed = i * 293.7;
      const sx = (seed * 0.41) % w;
      const sy = (seed * 0.29) % h;
      const twinkle = Math.sin(t * 2 + seed) * 0.5 + 0.5;
      const r = 1.5 + twinkle * 1.5;
      const alpha = 0.3 + twinkle * 0.4;

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
      ctx.fill();

      // 十字光芒
      ctx.strokeStyle = `rgba(255, 240, 200, ${alpha * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(sx - r * 3, sy);
      ctx.lineTo(sx + r * 3, sy);
      ctx.moveTo(sx, sy - r * 3);
      ctx.lineTo(sx, sy + r * 3);
      ctx.stroke();
    }

    // 流星偶尔划过
    for (let i = 0; i < 3; i++) {
      const seed = i * 487.1;
      const cycle = 8 + (seed % 12);
      const phase = (t + seed * 0.3) % cycle;
      if (phase > 1.5) continue; // 流星只存在 1.5 秒

      const startX = w * (0.2 + (seed % 50) * 0.01);
      const startY = h * (0.05 + (seed % 30) * 0.01);
      const angle = 0.6 + Math.sin(seed) * 0.3;
      const speed = 300;
      const progress = phase / 1.5;

      const mx = startX + Math.cos(angle) * speed * phase;
      const my = startY + Math.sin(angle) * speed * phase;
      const tailLen = 60 + progress * 40;

      const alpha = (1 - progress) * 0.8;

      // 流星尾迹
      const grad = ctx.createLinearGradient(mx, my, mx - Math.cos(angle) * tailLen, my - Math.sin(angle) * tailLen);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.3, `rgba(200, 220, 255, ${alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(200, 220, 255, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx - Math.cos(angle) * tailLen, my - Math.sin(angle) * tailLen);
      ctx.stroke();

      // 流星头
      ctx.beginPath();
      ctx.arc(mx, my, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    // 银河星云 — 淡淡的紫色/金色云团缓慢旋转
    const nebulaAlpha = 0.04 + Math.sin(t * 0.08) * 0.015;
    const nebulaGrad = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.5);
    nebulaGrad.addColorStop(0, `rgba(180, 140, 220, ${nebulaAlpha})`);
    nebulaGrad.addColorStop(0.4, `rgba(160, 120, 200, ${nebulaAlpha * 0.5})`);
    nebulaGrad.addColorStop(0.7, `rgba(200, 160, 100, ${nebulaAlpha * 0.3})`);
    nebulaGrad.addColorStop(1, 'rgba(200, 160, 100, 0)');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, w, h);
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/cosmic-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 50% 30%, #1a0e2e 0%, #050510 100%)"
      drawEffect={draw}
      overlayOpacity={0.8}
      blendMode="screen"
    />
  );
}
