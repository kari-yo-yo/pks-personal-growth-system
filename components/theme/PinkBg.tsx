'use client';

import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  swayPhase: number;
  opacity: number;
}

interface GlowOrb {
  x: number;
  y: number;
  r: number;
  color: string;
  driftX: number;
  driftY: number;
  pulse: number;
  pulseSpeed: number;
}

const PETAL_COLORS = [
  'rgba(244, 114, 182, 0.5)',
  'rgba(249, 168, 212, 0.4)',
  'rgba(251, 207, 232, 0.4)',
  'rgba(240, 171, 252, 0.35)',
  'rgba(255, 228, 230, 0.3)',
];

const GLOW_COLORS = [
  '244, 114, 182',
  '192, 132, 252',
  '249, 168, 212',
  '216, 180, 254',
];

export default function PinkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const c = canvas;
    const context = ctx;
    let animationId: number;
    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w;
      c.height = h;
    }

    // Petals
    const petals: Petal[] = [];
    for (let i = 0; i < 18; i++) {
      petals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 6 + 3,
        speedY: Math.random() * 0.4 + 0.15,
        speedX: (Math.random() - 0.5) * 0.25,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        swayPhase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.4 + 0.3,
      });
    }

    // Glow orbs (mist)
    const orbs: GlowOrb[] = [];
    for (let i = 0; i < 4; i++) {
      orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 200 + 120,
        color: GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)],
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.15,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.004 + 0.002,
      });
    }

    function drawPetal(p: Petal) {
      context.save();
      context.translate(p.x, p.y);
      context.rotate(p.rotation);
      context.globalAlpha = p.opacity;
      context.fillStyle = p.color;
      context.beginPath();
      // Draw petal shape (elliptical with curved ends)
      context.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function draw() {
      context.clearRect(0, 0, w, h);

      // Draw glow orbs (mist layer)
      for (let i = 0; i < orbs.length; i++) {
        const o = orbs[i];
        o.x += o.driftX;
        o.y += o.driftY;
        o.pulse += o.pulseSpeed;

        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r;
        if (o.y > h + o.r) o.y = -o.r;

        const pulseR = o.r * (0.9 + 0.1 * Math.sin(o.pulse));
        const alpha = 0.03 + 0.015 * Math.sin(o.pulse);

        const gradient = context.createRadialGradient(o.x, o.y, 0, o.x, o.y, pulseR);
        gradient.addColorStop(0, `rgba(${o.color}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${o.color}, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        context.beginPath();
        context.arc(o.x, o.y, pulseR, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();
      }

      // Draw petals
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.swayPhase) * 0.3;
        p.rotation += p.rotationSpeed;
        p.swayPhase += 0.008;

        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;

        drawPetal(p);
      }

      context.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
