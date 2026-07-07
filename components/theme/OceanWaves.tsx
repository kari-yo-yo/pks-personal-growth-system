'use client';

import { useEffect, useRef } from 'react';

export default function OceanWaves() {
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

    let time = 0;

    function draw() {
      time += 0.005;
      context.clearRect(0, 0, w, h);

      const waves = 4;
      for (let i = 0; i < waves; i++) {
        const alpha = 0.03 - i * 0.005;
        const amplitude = 20 + i * 10;
        const frequency = 0.002 + i * 0.0005;
        const speed = 0.5 + i * 0.2;
        const yOffset = h - 80 - i * 25;

        context.beginPath();
        context.moveTo(0, h);
        for (let x = 0; x <= w; x += 2) {
          const y =
            yOffset +
            Math.sin(x * frequency + time * speed + i) * amplitude +
            Math.sin(x * frequency * 2 + time * speed * 1.5) * (amplitude * 0.3);
          context.lineTo(x, y);
        }
        context.lineTo(w, h);
        context.closePath();
        context.fillStyle = `rgba(14, 165, 233, ${alpha})`;
        context.fill();
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '200px',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
