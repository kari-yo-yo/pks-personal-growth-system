'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Brain, FileText, Compass } from 'lucide-react';

const mainItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/wander', label: '漫游', icon: Compass },
  { href: '/knowledge', label: '知识', icon: Brain },
  { href: '/notes', label: '笔记', icon: FileText },
  { href: '/galaxy', label: '星图', icon: Sparkles },
];

export default function MobileNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-lg border-t border-white/5 md:hidden safe-bottom">
      <div className="flex justify-around items-center h-14">
        {mainItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 rounded-lg text-text-muted hover:text-text-secondary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
          <span className="text-xs font-medium">更多</span>
        </button>
      </div>
    </nav>
  );
}