'use client';

import { useState } from 'react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function ThemeSwitcherWrapper() {
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  return (
    <ThemeSwitcher
      isOpen={isThemeOpen}
      onToggle={() => setIsThemeOpen((prev) => !prev)}
    />
  );
}