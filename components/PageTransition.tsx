'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Wraps page content with a subtle fade+slide entrance animation.
 * Triggers on route change via pathname detection.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      setKey(pathname);
    }
  }, [pathname]);

  return (
    <div key={key} className="page-transition-wrapper">
      {children}
    </div>
  );
}
