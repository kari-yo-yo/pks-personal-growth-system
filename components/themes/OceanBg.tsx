'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
  alpha: number;
}

interface LightRay {
  x: number;
  width: number;
  speed: number;
  alpha: number;
  sway: number;
  swaySpeed: number;
}

interface Plankton {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
}

export default function OceanBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    timeRef.current += 0.016;
    const t = timeRef.current;

    ctx.clearRect(0, 0, width, height);

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#061a24');
    bgGrad.addColorStop(0.5, '#0c2a3a');
    bgGrad.addColorStop(1, '#0a1a2a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ocean waves (3 layered sine waves)
    for (let layer = 0; layer < 4; layer++) {
      const alpha = 0.06 + layer * 0.025;
      const waveHeight = 18 + layer * 6;
      const freq = 0.003 + layer * 0.001;
      const speed = 0.5 + layer * 0.15;
      const yOffset = height * (0.45 + layer * 0.12);

      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 2) {
        const y = yOffset
          + Math.sin(x * freq + t * speed) * waveHeight
          + Math.sin(x * freq * 1.7 + t * speed * 0.6 + 1) * (waveHeight * 0.5)
          + Math.sin(x * freq * 0.4 + t * speed * 0.8 + 2) * (waveHeight * 0.3);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      const hue = 170 + layer * 8;
      ctx.fillStyle = `hsla(${hue}, 70%, 55%, ${alpha})`;
      ctx.fill();
    }

    // 3. Bubbles
    const bubbleCount = 20;
    const bubbles: Bubble[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      const seed = i * 137.5;
      bubbles.push({
        x: ((seed * 13.7) % width),
        y: height + ((seed * 7.3) % (height * 0.6)),
        radius: 1.5 + (seed % 4),
        speedY: -(0.3 + (seed % 7) * 0.1),
        speedX: (seed % 3 - 1) * 0.15,
        wobbleSpeed: 0.5 + (seed % 5) * 0.2,
        wobbleAmp: 3 + (seed % 4),
        phase: (seed * 0.1) % (Math.PI * 2),
        alpha: 0.1 + (seed % 5) * 0.05,
      });
    }

    bubbles.forEach((b) => {
      const px = b.x + Math.sin(t * b.wobbleSpeed + b.phase) * b.wobbleAmp;
      const py = ((b.y + t * b.speedY * 60) % (height + 100)) - 50;

      ctx.beginPath();
      ctx.arc(px, py, b.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(45, 212, 191, ${b.alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Inner glow
      const innerGrad = ctx.createRadialGradient(px, py, 0, px, py, b.radius);
      innerGrad.addColorStop(0, `rgba(45, 212, 191, ${b.alpha * 0.4})`);
      innerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGrad;
      ctx.fill();
    });

    // 4. Light rays from above
    const rayCount = 6;
    for (let i = 0; i < rayCount; i++) {
      const seed = i * 89.3;
      const rx = (seed * 17.3) % width;
      const rw = 20 + (seed % 40);
      const rayAlpha = 0.02 + Math.sin(t * 0.15 + i * 1.2) * 0.01;
      const swayAmount = Math.sin(t * 0.1 + i * 0.7) * 30;

      const grad = ctx.createLinearGradient(rx + swayAmount, 0, rx + swayAmount + rw, height * 0.6);
      grad.addColorStop(0, `rgba(45, 212, 191, ${rayAlpha})`);
      grad.addColorStop(0.5, `rgba(34, 211, 238, ${rayAlpha * 0.6})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(rx + swayAmount, 0, rw, height * 0.6);
    }

    // 5. Plankton particles
    const planktonCount = 25;
    for (let i = 0; i < planktonCount; i++) {
      const seed = i * 73.1;
      const px = (seed * 11.3) % width;
      const py = ((seed * 7.7) % height);
      const pr = 1 + (seed % 3) * 0.5;
      const pAlpha = 0.15 + Math.sin(t * 0.5 + i * 0.9) * 0.1 + (seed % 5) * 0.03;
      const driftX = Math.sin(t * 0.2 + i * 1.1) * 20;
      const driftY = Math.sin(t * 0.15 + i * 0.8) * 10;

      ctx.beginPath();
      ctx.arc(px + driftX, py + driftY, pr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(45, 212, 191, ${Math.max(0, pAlpha)})`;
      ctx.fill();

      // Glow
      const glow = ctx.createRadialGradient(px + driftX, py + driftY, 0, px + driftX, py + driftY, pr * 4);
      glow.addColorStop(0, `rgba(45, 212, 191, ${Math.max(0, pAlpha * 0.3)})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px + driftX, py + driftY, pr * 4, 0, Math.PI * 2);
      ctx.fill();
    }
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