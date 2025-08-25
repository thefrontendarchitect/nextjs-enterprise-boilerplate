import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useMemo } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  // Theme (from theme.store.ts)
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Sidebar (from preferences.store.ts)
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Notifications (from preferences.store.ts)
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // Display (from preferences.store.ts)
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;

  // Table preferences (from preferences.store.ts)
  tablePageSize: number;
  setTablePageSize: (size: number) => void;

  // Reset all preferences
  resetUI: () => void;
}

const defaultState = {
  theme: 'system' as Theme,
  sidebarCollapsed: false,
  notificationsEnabled: true,
  compactMode: false,
  tablePageSize: 10,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...defaultState,

      // Theme actions
      setTheme: (theme) => {
        set({ theme });
        // DOM manipulation is handled by ThemeProvider to avoid conflicts
      },

      // Sidebar actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Notification actions
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      // Display actions
      setCompactMode: (compact) => set({ compactMode: compact }),

      // Table actions
      setTablePageSize: (size) => set({ tablePageSize: size }),

      // Reset all UI preferences
      resetUI: () => set(defaultState),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        notificationsEnabled: state.notificationsEnabled,
        compactMode: state.compactMode,
        tablePageSize: state.tablePageSize,
      }),
    }
  )
);

// Selector hooks for common use cases
export const useTheme = () => useUIStore((state) => state.theme);
export const useSetTheme = () => useUIStore((state) => state.setTheme);

export const useThemeActions = () => {
  const setTheme = useUIStore((state) => state.setTheme);
  // Memoize the return object to maintain referential equality
  return useMemo(() => ({ setTheme }), [setTheme]);
};

export const useSidebarState = () => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  return { sidebarCollapsed, setSidebarCollapsed, toggleSidebar };
};

export const usePreferences = () => {
  const compactMode = useUIStore((state) => state.compactMode);
  const setCompactMode = useUIStore((state) => state.setCompactMode);
  const notificationsEnabled = useUIStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useUIStore((state) => state.setNotificationsEnabled);
  const tablePageSize = useUIStore((state) => state.tablePageSize);
  const setTablePageSize = useUIStore((state) => state.setTablePageSize);
  const resetUI = useUIStore((state) => state.resetUI);

  return {
    compactMode,
    setCompactMode,
    notificationsEnabled,
    setNotificationsEnabled,
    tablePageSize,
    setTablePageSize,
    resetUI,
  };
};
