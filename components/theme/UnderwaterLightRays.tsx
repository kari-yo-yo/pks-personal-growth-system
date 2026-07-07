'use client';

import { useEffect, useRef } from 'react';

interface LightRay {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  alpha: number;
  speed: number;
  drift: number;
}

export default function UnderwaterLightRays({ count = 5 }: { count?: number }) {
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

    const rays: LightRay[] = [];
    for (let i = 0; i < count; i++) {
      rays.push({
        x: Math.random() * w,
        y: -50,
        width: Math.random() * 60 + 30,
        height: h * 0.7 + Math.random() * h * 0.3,
        angle: Math.random() * 0.3 + 0.1,
        alpha: Math.random() * 0.04 + 0.02,
        speed: Math.random() * 0.3 + 0.1,
        drift: Math.random() * Math.PI * 2,
      });
    }

    function draw() {
      context.clearRect(0, 0, w, h);

      for (let i = 0; i < rays.length; i++) {
        const r = rays[i];
        r.drift += r.speed * 0.01;
        const driftX = Math.sin(r.drift) * 30;

        context.save();
        context.translate(r.x + driftX, r.y);
        context.rotate(r.angle);

        const gradient = context.createLinearGradient(0, 0, 0, r.height);
        gradient.addColorStop(0, `rgba(224, 242, 254, ${r.alpha})`);
        gradient.addColorStop(0.5, `rgba(56, 189, 248, ${r.alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');

        context.fillStyle = gradient;
        context.fillRect(-r.width / 2, 0, r.width, r.height);

        // 光斑点缀
        const spotY = Math.random() * r.height * 0.8 + r.height * 0.1;
        const spotX = Math.sin(r.drift * 2 + i) * r.width * 0.3;
        context.beginPath();
        context.arc(spotX, spotY, Math.random() * 15 + 5, 0, Math.PI * 2);
        context.fillStyle = `rgba(224, 242, 254, ${r.alpha * 0.8})`;
        context.fill();

        context.restore();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

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
