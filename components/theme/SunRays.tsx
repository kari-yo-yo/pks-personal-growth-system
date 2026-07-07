'use client';

export default function SunRays() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '60%',
        height: '60%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '120%',
          height: '120%',
          background: `
            conic-gradient(
              from 0deg at 70% 20%,
              transparent 0deg,
              rgba(251, 191, 36, 0.03) 10deg,
              transparent 20deg,
              rgba(251, 191, 36, 0.04) 30deg,
              transparent 45deg,
              rgba(251, 191, 36, 0.02) 55deg,
              transparent 70deg,
              rgba(251, 191, 36, 0.03) 80deg,
              transparent 100deg
            )
          `,
          animation: 'sunRayRotate 30s linear infinite',
        }}
      />
      <style jsx>{`
        @keyframes sunRayRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
