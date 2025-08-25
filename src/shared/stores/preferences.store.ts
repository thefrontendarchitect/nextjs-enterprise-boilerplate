import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PreferencesState {
  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  
  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  
  // Display
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;
  
  // Table preferences
  tablePageSize: number;
  setTablePageSize: (size: number) => void;
  
  // Reset all preferences
  resetPreferences: () => void;
}

const defaultPreferences = {
  sidebarCollapsed: false,
  notificationsEnabled: true,
  compactMode: false,
  tablePageSize: 10,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      
      setCompactMode: (compact) => set({ compactMode: compact }),
      
      setTablePageSize: (size) => set({ tablePageSize: size }),
      
      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        notificationsEnabled: state.notificationsEnabled,
        compactMode: state.compactMode,
        tablePageSize: state.tablePageSize,
      }),
    }
  )
);