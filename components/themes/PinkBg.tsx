'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Petal {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  speedY: number;
  speedX: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  alpha: number;
  color: string;
}

interface MistOrb {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
  color1: string;
  color2: string;
}

interface Sparkle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
}

export default function PinkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    timeRef.current += 0.016;
    const t = timeRef.current;

    ctx.clearRect(0, 0, width, height);

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1a1018');
    bgGrad.addColorStop(0.5, '#2a1a28');
    bgGrad.addColorStop(1, '#1a0a20');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Pink mist orbs
    const mistOrbs: MistOrb[] = [
      {
        x: width * 0.2, y: height * 0.3, radius: width * 0.3,
        alpha: 0.10, pulseSpeed: 0.2, phase: 0,
        color1: 'rgba(244, 114, 182, ALPHA)',
        color2: 'rgba(232, 121, 249, ALPHA)',
      },
      {
        x: width * 0.75, y: height * 0.5, radius: width * 0.25,
        alpha: 0.08, pulseSpeed: 0.25, phase: 1.8,
        color1: 'rgba(249, 168, 212, ALPHA)',
        color2: 'rgba(244, 114, 182, ALPHA)',
      },
      {
        x: width * 0.5, y: height * 0.7, radius: width * 0.35,
        alpha: 0.07, pulseSpeed: 0.18, phase: 3.2,
        color1: 'rgba(236, 72, 153, ALPHA)',
        color2: 'rgba(244, 114, 182, ALPHA)',
      },
      {
        x: width * 0.9, y: height * 0.2, radius: width * 0.2,
        alpha: 0.06, pulseSpeed: 0.3, phase: 4.5,
        color1: 'rgba(251, 207, 232, ALPHA)',
        color2: 'rgba(249, 168, 212, ALPHA)',
      },
    ];

    mistOrbs.forEach((orb) => {
      const pulse = Math.sin(t * orb.pulseSpeed + orb.phase) * 0.35 + 0.65;
      const currentAlpha = orb.alpha * pulse;
      const driftX = Math.sin(t * 0.03 + orb.phase) * 20;
      const driftY = Math.cos(t * 0.025 + orb.phase * 0.7) * 15;

      const grad = ctx.createRadialGradient(
        orb.x + driftX, orb.y + driftY, 0,
        orb.x + driftX, orb.y + driftY, orb.radius
      );
      const c1 = orb.color1.replace('ALPHA', (currentAlpha * 0.7).toString());
      const c2 = orb.color2.replace('ALPHA', (currentAlpha * 0.3).toString());
      grad.addColorStop(0, c1);
      grad.addColorStop(0.4, c2);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(orb.x + driftX - orb.radius, orb.y + driftY - orb.radius, orb.radius * 2, orb.radius * 2);
    });

    // 3. Falling flower petals
    const petalCount = 19;
    const petalColors = [
      'hsla(330, 80%, 65%, ALPHA)',
      'hsla(340, 85%, 70%, ALPHA)',
      'hsla(320, 75%, 60%, ALPHA)',
      'hsla(350, 70%, 75%, ALPHA)',
      'hsla(335, 80%, 55%, ALPHA)',
    ];

    for (let i = 0; i < petalCount; i++) {
      const seed = i * 59.3;
      const px = (seed * 13.1) % width;
      const py = ((seed * 7.9) % (height + 120)) - 60;
      const pw = 6 + (seed % 6);
      const ph = 3 + (seed % 4);
      const rot = t * (0.2 + (seed % 6) * 0.08) + seed * 0.15;
      const alpha = 0.2 + (seed % 5) * 0.07;
      const sway = Math.sin(t * 0.35 + i * 0.7) * 12;
      const fallY = (py + t * (15 + (seed % 8) * 1.5)) % (height + 120);
      const colorIdx = seed % petalColors.length;
      const color = petalColors[colorIdx].replace('ALPHA', alpha.toString());

      ctx.save();
      ctx.translate(px + sway, fallY);
      ctx.rotate(rot);

      // Petal shape - teardrop-like ellipse
      ctx.beginPath();
      ctx.ellipse(0, 0, pw, ph, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Petal highlight
      ctx.beginPath();
      ctx.ellipse(-pw * 0.2, -ph * 0.2, pw * 0.3, ph * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
      ctx.fill();

      ctx.restore();
    }

    // 4. Soft sparkle particles
    const sparkleCount = 20;
    for (let i = 0; i < sparkleCount; i++) {
      const seed = i * 41.7;
      const sx = (seed * 19.3) % width;
      const sy = ((seed * 13.7) % height);
      const sr = 0.8 + (seed % 3) * 0.4;
      const twinkle = 0.3 + Math.sin(t * (0.5 + (seed % 5) * 0.1) + i * 1.1) * 0.35;
      const alpha = Math.max(0, twinkle);
      const driftX = Math.sin(t * 0.08 + i * 0.9) * 10;
      const driftY = Math.cos(t * 0.06 + i * 0.7) * 8;

      // Cross sparkle shape
      ctx.save();
      ctx.translate(sx + driftX, sy + driftY);
      ctx.rotate(t * 0.1 + i * 0.5);

      for (let j = 0; j < 4; j++) {
        const angle = (j / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const endX = Math.cos(angle) * sr * 3;
        const endY = Math.sin(angle) * sr * 3;
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(255, 200, 230, ${alpha * 0.6})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, sr * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 240, ${alpha})`;
      ctx.fill();

      ctx.restore();
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