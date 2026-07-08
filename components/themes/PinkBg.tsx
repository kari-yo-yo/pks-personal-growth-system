'use client';

import PhotorealBg from './PhotorealBg';

export default function PinkBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // 半透明白色/粉色光点 — 如同浪花飞溅
    for (let i = 0; i < 35; i++) {
      const seed = i * 163.3;
      const px = (seed * 0.47 + Math.sin(t * 0.2 + seed) * 25 + t * 7) % (w + 50) - 25;
      const py = (seed * 0.23 + Math.cos(t * 0.15 + seed) * 30) % h;
      const life = Math.sin(t * 0.5 + seed) * 0.5 + 0.5;
      const r = 1.5 + life * 3;
      const alpha = life * 0.3;

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 230, 245, ${alpha})`;
      ctx.fill();
    }

    // 柔和的粉色雾气条带 — 像海浪上方的薄雾
    for (let i = 0; i < 4; i++) {
      const seed = i * 283.1;
      const y = h * (0.4 + i * 0.15) + Math.sin(t * 0.2 + seed) * 20;
      const alpha = 0.03 + Math.sin(t * 0.3 + seed) * 0.015;

      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.005 + t * 0.4 + seed) * 15);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, y - 30, 0, y + 60);
      grad.addColorStop(0, 'rgba(255, 200, 220, 0)');
      grad.addColorStop(0.5, `rgba(255, 180, 210, ${alpha})`);
      grad.addColorStop(1, 'rgba(255, 180, 210, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // 缓缓飘落的花瓣状粒子
    for (let i = 0; i < 8; i++) {
      const seed = i * 431.7;
      const cycle = 14 + (seed % 6);
      const phase = (t + seed * 0.15) % cycle;
      if (phase > 10) continue;

      const progress = phase / 10;
      const lx = (seed * 0.27 + Math.sin(t * 0.4 + seed) * 60) % w;
      const ly = -15 + progress * (h + 30);
      const rot = t * 0.6 + seed;
      const sway = Math.sin(t * 1.2 + seed) * 15;
      const alpha = 0.4 * (1 - progress * 0.5);

      ctx.save();
      ctx.translate(lx + sway, ly);
      ctx.rotate(rot);
      ctx.beginPath();
      // 绘制樱花瓣形状（椭圆带尖端）
      ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 190, 210, ${alpha})`;
      ctx.fill();
      ctx.restore();
    }

    // 整体粉色光晕 — 增强氛围
    const haloAlpha = 0.03 + Math.sin(t * 0.4) * 0.015;
    const haloGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.6);
    haloGrad.addColorStop(0, `rgba(255, 180, 200, ${haloAlpha})`);
    haloGrad.addColorStop(1, 'rgba(255, 180, 200, 0)');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, w, h);
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/pink-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 50% 40%, #2a1a24 0%, #1a1018 100%)"
      drawEffect={draw}
      overlayOpacity={0.6}
      blendMode="screen"
    />
  );
}
