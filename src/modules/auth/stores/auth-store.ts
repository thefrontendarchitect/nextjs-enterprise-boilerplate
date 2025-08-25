import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/shared/types/auth';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateLastActivity: () => void;
  logout: () => void;
  
  // Computed
  isSessionExpired: () => boolean;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Client-side auth state store
 * This complements the server-side session management
 * Used for UI state and optimistic updates
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: true,
        lastActivity: null,

        // Set authenticated user
        setUser: (user) => 
          set(
            { 
              user, 
              isAuthenticated: !!user,
              lastActivity: user ? Date.now() : null,
            },
            false,
            'setUser'
          ),

        // Set loading state
        setLoading: (loading) => 
          set({ isLoading: loading }, false, 'setLoading'),

        // Update last activity timestamp
        updateLastActivity: () => 
          set(
            { lastActivity: Date.now() },
            false,
            'updateLastActivity'
          ),

        // Clear auth state
        logout: () => 
          set(
            {
              user: null,
              isAuthenticated: false,
              lastActivity: null,
            },
            false,
            'logout'
          ),

        // Check if session is expired based on inactivity
        isSessionExpired: () => {
          const { lastActivity } = get();
          if (!lastActivity) return false;
          
          return Date.now() - lastActivity > SESSION_TIMEOUT;
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          // Only persist non-sensitive data
          lastActivity: state.lastActivity,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Selector hooks for common use cases
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

// Activity tracker for auto-logout
if (typeof window !== 'undefined') {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  const updateActivity = () => {
    const { isAuthenticated, updateLastActivity } = useAuthStore.getState();
    if (isAuthenticated) {
      updateLastActivity();
    }
  };

  events.forEach((event) => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // Check for session expiry every minute
  setInterval(() => {
    const { isSessionExpired, logout, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && isSessionExpired()) {
      logout();
      // Optionally redirect to login
      window.location.href = '/login?reason=session_expired';
    }
  }, 60000);
}