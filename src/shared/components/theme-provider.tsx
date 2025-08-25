'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/shared/stores/theme.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Apply theme on mount and when it changes
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (theme === 'system') {
          root.classList.toggle('dark', e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.toggle('dark', theme === 'dark');
      return undefined;
    }
  }, [theme]);

  return <>{children}</>;
}