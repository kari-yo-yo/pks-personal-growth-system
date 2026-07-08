'use client';

import PhotorealBg from './PhotorealBg';
import { assetPath } from '@/lib/config';
import {
  drawInkWash,
  noise2D,
  breatheSlow,
  clamp,
} from '@/lib/themeUtils';

export default function InkBg() {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    // === 1. 墨韵流动 — 在墨色浓郁区域，墨色缓慢「呼吸」 ===
    const inkAlpha = breatheSlow(t, 18, 0.03, 0.08);

    // Multiple ink wash clouds at different positions
    const inkPositions = [
      { x: 0.3, y: 0.25, w: 0.35, h: 0.2 },
      { x: 0.7, y: 0.35, w: 0.3, h: 0.18 },
      { x: 0.5, y: 0.15, w: 0.4, h: 0.15 },
    ];

    for (let i = 0; i < inkPositions.length; i++) {
      const pos = inkPositions[i];
      const drift = Math.sin(t * 0.08 + i * 2.1) * w * 0.03;
      const px = w * pos.x + drift;
      const py = h * pos.y + Math.cos(t * 0.06 + i * 1.7) * h * 0.02;
      const pw = w * pos.w;
      const ph = h * pos.h;

      drawInkWash(ctx, px, py, pw, ph, inkAlpha * (0.6 + i * 0.2), t * 0.02 + i);
    }

    // === 2. 远山浮动 — 画面下方远山轮廓极其缓慢移动 ===
    const mountainAlpha = 0.04 + Math.sin(t * 0.05) * 0.015;
    const mountainDrift = Math.sin(t * 0.03) * w * 0.05;

    ctx.save();
    ctx.globalAlpha = mountainAlpha;
    ctx.fillStyle = '#1a1a1a';

    // Distant mountain shapes
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    for (let x = 0; x <= w; x += 20) {
      const noise = noise2D((x + mountainDrift) * 0.002, t * 0.01);
      const my = h * 0.65 + noise * h * 0.08;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // === 3. 留白呼吸 — 画面中的留白区域缓慢变化 ===
    const spaceAlpha = breatheSlow(t, 20, 0.02, 0.05);
    const spaceGrad = ctx.createRadialGradient(
      w * 0.5, h * 0.4, 0,
      w * 0.5, h * 0.4, Math.max(w, h) * 0.6
    );
    spaceGrad.addColorStop(0, `rgba(240, 240, 235, ${spaceAlpha})`);
    spaceGrad.addColorStop(0.5, `rgba(230, 230, 225, ${spaceAlpha * 0.5})`);
    spaceGrad.addColorStop(1, `rgba(220, 220, 215, 0)`);
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);

    // === 4. 水雾流动 — 瀑布区域的水汽 ===
    const mistAlpha = breatheSlow(t, 14, 0.02, 0.04);
    const mistGrad = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.55);
    mistGrad.addColorStop(0, `rgba(200, 200, 195, 0)`);
    mistGrad.addColorStop(0.5, `rgba(190, 190, 185, ${mistAlpha})`);
    mistGrad.addColorStop(1, `rgba(200, 200, 195, 0)`);
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, h * 0.2, w, h * 0.35);

    // === 5. 极淡墨点 — 增添纸墨质感 ===
    for (let i = 0; i < 10; i++) {
      const seed = i * 371.3;
      const px = (seed * 0.43) % w;
      const py = (seed * 0.27) % h;
      const dotAlpha = 0.03 + Math.sin(t * 0.2 + seed) * 0.015;
      const radius = 1 + (seed % 2);

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(40, 40, 40, ${dotAlpha})`;
      ctx.fill();
    }
  };

  return (
    <PhotorealBg
      imageSrc={assetPath('/images/themes/ink-bg.jpg')}
      fallbackGradient="radial-gradient(ellipse at 50% 40%, #1a1a15 0%, #0a0a08 100%)"
      drawEffect={draw}
      overlayOpacity={0.35}
      blendMode="multiply"
      darkOverlay={0.25}
    />
  );
}
