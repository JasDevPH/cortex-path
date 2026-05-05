'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-teal-400"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={11} /> : <Moon size={11} />}
      {isDark ? 'light' : 'dark'}
    </button>
  );
}
