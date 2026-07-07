'use client';

import { useEffect, useRef } from 'react';

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
  cooldown: number;
}

export default function MeteorShower() {
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

    const meteors: Meteor[] = [];
    for (let i = 0; i < 3; i++) {
      meteors.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        alpha: 0,
        active: false,
        cooldown: Math.random() * 600 + 300,
      });
    }

    function draw() {
      context.clearRect(0, 0, w, h);

      for (let i = 0; i < meteors.length; i++) {
        const m = meteors[i];

        if (!m.active) {
          m.cooldown--;
          if (m.cooldown <= 0) {
            m.active = true;
            m.x = Math.random() * w * 0.8 + w * 0.1;
            m.y = Math.random() * h * 0.3;
            m.alpha = 1;
            m.cooldown = Math.random() * 600 + 400;
          }
          continue;
        }

        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= 0.008;

        if (m.alpha <= 0 || m.x > w + 100 || m.y > h + 100) {
          m.active = false;
          m.alpha = 0;
          continue;
        }

        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const gradient = context.createLinearGradient(tailX, tailY, m.x, m.y);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${m.alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`);

        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(m.x, m.y);
        context.strokeStyle = gradient;
        context.lineWidth = 1.5;
        context.stroke();

        // Head glow
        context.beginPath();
        context.arc(m.x, m.y, 2, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
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
