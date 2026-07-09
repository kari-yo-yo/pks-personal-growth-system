'use client';

import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export default function PageLayout({
  children,
  className = '',
  maxWidth = '5xl',
}: PageLayoutProps) {
  const maxWidthClass = maxWidthClasses[maxWidth] || 'max-w-5xl';

  return (
    <div className={`min-h-screen relative ${className}`}>
      <main className={`pt-20 pb-12 px-4 sm:px-6 lg:px-8 ${maxWidthClass} mx-auto relative z-10`}>
        {children}
      </main>
    </div>
  );
}
