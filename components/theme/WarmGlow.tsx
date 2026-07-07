'use client';

import { useEffect, useState } from 'react';

interface GlowOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export default function WarmGlow({ count = 6 }: { count?: number }) {
  const [orbs, setOrbs] = useState<GlowOrb[]>([]);

  useEffect(() => {
    const o: GlowOrb[] = [];
    for (let i = 0; i < count; i++) {
      o.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 200 + 100,
        duration: Math.random() * 5 + 4,
        delay: Math.random() * 5,
        color: Math.random() > 0.5 ? '#fbbf24' : '#fb923c',
      });
    }
    setOrbs(o);
  }, [count]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {orbs.map((orb) => (
        <div
          key={orb.id}
          style={{
            position: 'absolute',
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}18 0%, transparent 70%)`,
            filter: 'blur(30px)',
            animation: `warmGlowPulse ${orb.duration}s ease-in-out ${orb.delay}s infinite alternate`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes warmGlowPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
