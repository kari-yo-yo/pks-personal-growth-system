'use client';

import { useEffect, useState } from 'react';

interface Spot {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export default function LightSpots({ count = 8 }: { count?: number }) {
  const [spots, setSpots] = useState<Spot[]>([]);

  useEffect(() => {
    const s: Spot[] = [];
    for (let i = 0; i < count; i++) {
      s.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 120 + 60,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 4,
        color: Math.random() > 0.5 ? '#facc15' : '#4ade80',
      });
    }
    setSpots(s);
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
      {spots.map((spot) => (
        <div
          key={spot.id}
          style={{
            position: 'absolute',
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: spot.size,
            height: spot.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${spot.color}15 0%, transparent 70%)`,
            filter: 'blur(20px)',
            animation: `lightSpotSway ${spot.duration}s ease-in-out ${spot.delay}s infinite alternate`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes lightSpotSway {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
