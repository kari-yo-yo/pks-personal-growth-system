'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
  color1: string;
  color2: string;
  color3: string;
}

interface Comet {
  x: number;
  y: number;
  active: boolean;
  speed: number;
  angle: number;
  length: number;
  alpha: number;
  timer: number;
}

export default function CosmicBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const cometRef = useRef<Comet>({
    x: 0, y: 0, active: false,
    speed: 6, angle: -0.4, length: 80,
    alpha: 1, timer: 0,
  });

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    timeRef.current += 0.016;
    const t = timeRef.current;

    ctx.clearRect(0, 0, width, height);

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#050510');
    bgGrad.addColorStop(0.5, '#0a0a1a');
    bgGrad.addColorStop(1, '#080818');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Nebula clouds
    const nebulas: Nebula[] = [
      {
        x: width * 0.2, y: height * 0.3, radius: width * 0.3,
        alpha: 0.08, pulseSpeed: 0.1, phase: 0,
        color1: 'rgba(139, 92, 246, ALPHA)',
        color2: 'rgba(99, 102, 241, ALPHA)',
        color3: 'rgba(59, 130, 246, ALPHA)',
      },
      {
        x: width * 0.7, y: height * 0.5, radius: width * 0.25,
        alpha: 0.06, pulseSpeed: 0.12, phase: 1.5,
        color1: 'rgba(168, 85, 247, ALPHA)',
        color2: 'rgba(139, 92, 246, ALPHA)',
        color3: 'rgba(99, 102, 241, ALPHA)',
      },
      {
        x: width * 0.4, y: height * 0.6, radius: width * 0.2,
        alpha: 0.05, pulseSpeed: 0.08, phase: 3.0,
        color1: 'rgba(59, 130, 246, ALPHA)',
        color2: 'rgba(139, 92, 246, ALPHA)',
        color3: 'rgba(99, 102, 241, ALPHA)',
      },
      {
        x: width * 0.85, y: height * 0.2, radius: width * 0.15,
        alpha: 0.04, pulseSpeed: 0.15, phase: 4.2,
        color1: 'rgba(192, 132, 252, ALPHA)',
        color2: 'rgba(168, 85, 247, ALPHA)',
        color3: 'rgba(139, 92, 246, ALPHA)',
      },
    ];

    nebulas.forEach((nb) => {
      const pulse = Math.sin(t * nb.pulseSpeed + nb.phase) * 0.3 + 0.7;
      const currentAlpha = nb.alpha * pulse;
      const driftX = Math.sin(t * 0.02 + nb.phase) * 10;
      const driftY = Math.cos(t * 0.015 + nb.phase * 0.7) * 8;

      const grad = ctx.createRadialGradient(
        nb.x + driftX, nb.y + driftY, 0,
        nb.x + driftX, nb.y + driftY, nb.radius
      );
      const c1 = nb.color1.replace('ALPHA', (currentAlpha * 0.8).toString());
      const c2 = nb.color2.replace('ALPHA', (currentAlpha * 0.4).toString());
      const c3 = nb.color3.replace('ALPHA', (currentAlpha * 0.2).toString());
      grad.addColorStop(0, c1);
      grad.addColorStop(0.3, c2);
      grad.addColorStop(0.6, c3);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(nb.x + driftX - nb.radius, nb.y + driftY - nb.radius, nb.radius * 2, nb.radius * 2);
    });

    // 3. Milky Way glow (horizontal band)
    const mwGrad = ctx.createRadialGradient(
      width * 0.5, height * 0.35, 0,
      width * 0.5, height * 0.35, width * 0.6
    );
    mwGrad.addColorStop(0, 'rgba(200, 180, 240, 0.03)');
    mwGrad.addColorStop(0.3, 'rgba(150, 140, 220, 0.02)');
    mwGrad.addColorStop(0.6, 'rgba(100, 100, 200, 0.01)');
    mwGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = mwGrad;
    ctx.fillRect(0, 0, width, height);

    // Narrower band across the middle
    const mwGrad2 = ctx.createRadialGradient(
      width * 0.5, height * 0.35, 0,
      width * 0.5, height * 0.35, width * 0.3
    );
    mwGrad2.addColorStop(0, 'rgba(220, 210, 250, 0.02)');
    mwGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = mwGrad2;
    ctx.fillRect(width * 0.1, height * 0.2, width * 0.8, height * 0.3);

    // 4. Stars
    const starCount = 400;
    for (let i = 0; i < starCount; i++) {
      const seed = i * 47.3;
      const sx = (seed * 13.1) % width;
      const sy = ((seed * 7.9) % height);
      const sr = 0.3 + (seed % 5) * 0.25;
      const twinkle = 0.3 + Math.sin(t * (0.3 + (seed % 10) * 0.03) + i * 0.5) * 0.35;
      const alpha = Math.max(0, twinkle * 0.7 + 0.15);

      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    // 5. Brighter stars with glow
    const brightStarCount = 30;
    for (let i = 0; i < brightStarCount; i++) {
      const seed = i * 173.7;
      const sx = (seed * 17.3) % width;
      const sy = ((seed * 11.3) % height);
      const sr = 0.8 + (seed % 3) * 0.4;
      const twinkle = 0.3 + Math.sin(t * (0.2 + (seed % 5) * 0.04) + i * 0.7) * 0.35;
      const alpha = Math.max(0, twinkle);
      const hue = 200 + (seed % 40);

      // Glow
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 4);
      glow.addColorStop(0, `hsla(${hue}, 60%, 80%, ${alpha * 0.3})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 40%, 95%, ${alpha})`;
      ctx.fill();
    }

    // 6. Comet
    const comet = cometRef.current;
    comet.timer += 0.016;

    if (!comet.active && comet.timer > 15 + Math.random() * 15) {
      comet.active = true;
      comet.x = width * (0.7 + Math.random() * 0.3);
      comet.y = height * (0.1 + Math.random() * 0.15);
      comet.angle = -0.4 - Math.random() * 0.2;
      comet.speed = 5 + Math.random() * 3;
      comet.length = 60 + Math.random() * 40;
      comet.alpha = 1;
      comet.timer = 0;
    }

    if (comet.active) {
      comet.x += Math.cos(comet.angle) * comet.speed;
      comet.y += Math.sin(comet.angle) * comet.speed;
      comet.alpha -= 0.003;

      // Comet tail gradient
      const tailGrad = ctx.createLinearGradient(
        comet.x, comet.y,
        comet.x - Math.cos(comet.angle) * comet.length,
        comet.y - Math.sin(comet.angle) * comet.length
      );
      tailGrad.addColorStop(0, `rgba(255, 240, 200, ${comet.alpha * 0.9})`);
      tailGrad.addColorStop(0.1, `rgba(255, 220, 150, ${comet.alpha * 0.6})`);
      tailGrad.addColorStop(0.4, `rgba(200, 180, 255, ${comet.alpha * 0.3})`);
      tailGrad.addColorStop(0.7, `rgba(140, 120, 255, ${comet.alpha * 0.15})`);
      tailGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(comet.x, comet.y);
      const tailW = 2 + comet.alpha * 2;
      ctx.lineTo(
        comet.x - Math.cos(comet.angle) * comet.length,
        comet.y - Math.sin(comet.angle) * comet.length - tailW
      );
      ctx.lineTo(
        comet.x - Math.cos(comet.angle) * comet.length,
        comet.y - Math.sin(comet.angle) * comet.length + tailW
      );
      ctx.closePath();
      ctx.fillStyle = tailGrad;
      ctx.fill();

      // Comet head glow
      const headGlow = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 8);
      headGlow.addColorStop(0, `rgba(255, 250, 240, ${comet.alpha * 0.8})`);
      headGlow.addColorStop(0.5, `rgba(255, 220, 180, ${comet.alpha * 0.3})`);
      headGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Comet head core
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${comet.alpha})`;
      ctx.fill();

      if (comet.alpha <= 0 || comet.x < -50 || comet.x > width + 50 || comet.y > height + 50) {
        comet.active = false;
      }
    }

    // 7. Alpenglow on snow mountains (subtle bottom glow)
    const alpenglowGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
    alpenglowGrad.addColorStop(0, 'transparent');
    alpenglowGrad.addColorStop(0.5, 'rgba(212, 165, 116, 0.02)');
    alpenglowGrad.addColorStop(1, 'rgba(139, 92, 246, 0.03)');
    ctx.fillStyle = alpenglowGrad;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      draw(ctx, canvas.width, canvas.height);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}