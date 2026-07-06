import type { Metadata } from 'next';
import './globals.css';
import GlobalSearch from '@/components/GlobalSearch';
import InsightFAB from '@/components/InsightFAB';

export const metadata: Metadata = {
  title: '个人知识系统',
  description: 'Personal Knowledge Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        <Starfield />
        {children}
        <GlobalSearch />
        <InsightFAB />
      </body>
    </html>
  );
}

function Starfield() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${3 + Math.random() * 3}s`,
    size: Math.random() > 0.8 ? 3 : 2,
  }));

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            animationDuration: star.duration,
            width: star.size,
            height: star.size,
          }}
        />
      ))}
    </div>
  );
}