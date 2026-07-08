'use client';

import PhotorealBg from './PhotorealBg';

export default function HopeBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // 金色温暖光斑 — 地中海阳光透过拱门洒落
    for (let i = 0; i < 25; i++) {
      const seed = i * 157.1;
      const cx = (seed * 0.53 + Math.sin(t * 0.12 + seed) * 50) % (w + 100) - 50;
      const cy = (seed * 0.29) % (h * 0.8) + h * 0.1;
      const life = Math.sin(t * 0.6 + seed) * 0.5 + 0.5;
      const r = 8 + life * 20;
      const alpha = life * 0.2;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 210, 120, ${alpha})`;
      ctx.fill();
    }

    // 柔和的金色光晕脉动（从画面右上方向左下方蔓延）
    const glowR = 80 + Math.sin(t * 0.5) * 30;
    const glowAlpha = 0.06 + Math.sin(t * 0.8) * 0.03;
    const glowGrad = ctx.createRadialGradient(w * 0.7, h * 0.2, 0, w * 0.7, h * 0.2, glowR * 3);
    glowGrad.addColorStop(0, `rgba(255, 200, 100, ${glowAlpha})`);
    glowGrad.addColorStop(0.5, `rgba(255, 180, 80, ${glowAlpha * 0.5})`);
    glowGrad.addColorStop(1, 'rgba(255, 160, 60, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // 微小花瓣/尘埃粒子 — 在暖光中飘动
    for (let i = 0; i < 30; i++) {
      const seed = i * 127.7;
      const px = (seed * 0.43 + Math.sin(t * 0.18 + seed) * 30 + t * 6) % (w + 40) - 20;
      const py = (seed * 0.19 + Math.cos(t * 0.12 + seed) * 40 + t * 4) % h;
      const alpha = 0.2 + Math.sin(t * 0.7 + seed) * 0.15;
      const size = 1 + (seed % 2);
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 160, ${alpha})`;
      ctx.fill();
    }

    // 斜向的阳光射线（淡淡的）
    for (let i = 0; i < 5; i++) {
      const seed = i * 217.3;
      const angle = -0.3 + Math.sin(t * 0.05 + seed) * 0.05;
      const x = w * 0.6 + i * 40 + Math.sin(t * 0.1 + seed) * 20;
      const alpha = 0.02 + Math.sin(t * 0.4 + seed) * 0.01;

      ctx.save();
      ctx.translate(x, -50);
      ctx.rotate(angle);
      const grad = ctx.createLinearGradient(0, 0, 0, h + 100);
      grad.addColorStop(0, `rgba(255, 220, 150, ${alpha})`);
      grad.addColorStop(0.5, `rgba(255, 200, 120, ${alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(255, 200, 120, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(-8, 0, 16, h + 100);
      ctx.restore();
    }
  };

  return (
    <PhotorealBg
      imageSrc="/images/themes/hope-bg.jpg"
      fallbackGradient="radial-gradient(ellipse at 70% 20%, #3a2a10 0%, #1a1005 100%)"
      drawEffect={draw}
      overlayOpacity={0.65}
      blendMode="screen"
    />
  );
}
