import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            root.classList.toggle('dark', systemTheme === 'dark');
          } else {
            root.classList.toggle('dark', theme === 'dark');
          }
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);