'use client';

import { useEffect } from 'react';
import { useTheme } from '@/shared/stores/ui-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    // Remove both classes first to ensure clean state
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      // Apply system theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Apply explicit theme
      root.classList.add(theme);
      return undefined;
    }
  }, [theme]);

  return <>{children}</>;
}
