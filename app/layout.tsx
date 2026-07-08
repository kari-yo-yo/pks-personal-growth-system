import type { Metadata } from 'next';
import './globals.css';
import GlobalSearch from '@/components/GlobalSearch';
import InsightFAB from '@/components/InsightFAB';
import Navigation from '@/components/Navigation';
import ThemeProvider from '@/components/ThemeProvider';
import ThemeSwitcherWrapper from '@/components/ThemeSwitcherWrapper';

export const metadata: Metadata = {
  title: '个人知识系统',
  description: 'Personal Knowledge Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        <ThemeProvider>
          <Navigation />
          <main className="main-content pb-16 md:pb-0">
            {children}
          </main>
          <GlobalSearch />
          <InsightFAB />
          <ThemeSwitcherWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}