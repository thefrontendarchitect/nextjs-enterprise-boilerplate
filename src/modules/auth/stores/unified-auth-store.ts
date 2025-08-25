import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authApi } from '../api/auth.api';
import type { User, AuthTokens } from '@/shared/types/auth';
// Unified auth store combining all auth functionality

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

interface UnifiedAuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number | null;
  isInitialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateLastActivity: () => void;
  clearAuthState: () => void;
  initializeAuth: () => Promise<void>;

  // Token management (unified from auth service)
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
  refreshAccessToken: () => Promise<string | null>;

  // Computed
  isSessionExpired: () => boolean;

  // Session management
  startSessionMonitoring: () => () => void;
  startActivityTracking: () => () => void;
}

// Token refresh deduplication with improved queue management
interface RefreshQueueItem {
  resolve: (token: string | null) => void;
  reject: (error: Error) => void;
}

class TokenRefreshManager {
  private refreshQueue: RefreshQueueItem[] = [];
  private isRefreshing = false;

  async refresh(refreshFn: () => Promise<string | null>): Promise<string | null> {
    // If already refreshing, add to queue
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    // Start refresh process
    this.isRefreshing = true;

    try {
      const token = await refreshFn();

      // Resolve all queued promises
      this.refreshQueue.forEach((item) => item.resolve(token));
      this.refreshQueue = [];

      return token;
    } catch (error) {
      // Reject all queued promises
      this.refreshQueue.forEach((item) => item.reject(error as Error));
      this.refreshQueue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  reset() {
    this.refreshQueue = [];
    this.isRefreshing = false;
  }
}

const tokenRefreshManager = new TokenRefreshManager();

export const useAuthStore = create<UnifiedAuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: true,
        lastActivity: null,
        isInitialized: false,

        // Login method (combines auth context + service logic)
        login: async (email: string, password: string): Promise<boolean> => {
          set({ isLoading: true }, false, 'login_start');

          try {
            const result = await authApi.login({ email, password });

            if (result.success) {
              const tokens = {
                accessToken: result.data.accessToken,
                refreshToken: result.data.refreshToken,
              };

              // Store tokens in localStorage
              get().setTokens(tokens);

              // Set user and update state
              set(
                {
                  user: result.data.user,
                  isAuthenticated: true,
                  lastActivity: Date.now(),
                  isLoading: false,
                },
                false,
                'login_success'
              );

              return true;
            }

            set({ isLoading: false }, false, 'login_error');
            return false;
          } catch {
            set({ isLoading: false }, false, 'login_error');
            return false;
          }
        },

        // Logout method (combines auth context + service logic)
        logout: async (): Promise<void> => {
          set({ isLoading: true }, false, 'logout_start');

          try {
            await authApi.logout();
          } catch {
            // Continue with logout even if API call fails
          }

          // Clear all auth state
          get().clearTokens();
          set(
            {
              user: null,
              isAuthenticated: false,
              lastActivity: null,
              isLoading: false,
            },
            false,
            'logout_complete'
          );
        },

        // Register method
        register: async (email: string, password: string, name: string): Promise<boolean> => {
          set({ isLoading: true }, false, 'register_start');

          try {
            const result = await authApi.register({ email, password, name });

            if (result.success) {
              const tokens = {
                accessToken: result.data.accessToken,
                refreshToken: result.data.refreshToken,
              };

              get().setTokens(tokens);

              set(
                {
                  user: result.data.user,
                  isAuthenticated: true,
                  lastActivity: Date.now(),
                  isLoading: false,
                },
                false,
                'register_success'
              );

              return true;
            }

            set({ isLoading: false }, false, 'register_error');
            return false;
          } catch {
            set({ isLoading: false }, false, 'register_error');
            return false;
          }
        },

        // Refresh user method
        refreshUser: async (): Promise<void> => {
          set({ isLoading: true }, false, 'refresh_user_start');

          try {
            const result = await authApi.getMe();

            if (result.success) {
              set(
                {
                  user: result.data,
                  isAuthenticated: true,
                  lastActivity: Date.now(),
                  isLoading: false,
                },
                false,
                'refresh_user_success'
              );
            } else {
              get().clearAuthState();
              set({ isLoading: false }, false, 'refresh_user_error');
            }
          } catch {
            get().clearAuthState();
            set({ isLoading: false }, false, 'refresh_user_error');
          }
        },

        // Basic state setters
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

        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),

        updateLastActivity: () => set({ lastActivity: Date.now() }, false, 'updateLastActivity'),

        clearAuthState: () =>
          set(
            {
              user: null,
              isAuthenticated: false,
              lastActivity: null,
            },
            false,
            'clearAuthState'
          ),

        // Token management methods (from auth service)
        getAccessToken: (): string | null => {
          if (typeof window === 'undefined') return null;
          return localStorage.getItem(ACCESS_TOKEN_KEY);
        },

        getRefreshToken: (): string | null => {
          if (typeof window === 'undefined') return null;
          return localStorage.getItem(REFRESH_TOKEN_KEY);
        },

        setTokens: (tokens: AuthTokens): void => {
          if (typeof window === 'undefined') return;
          localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        },

        clearTokens: (): void => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        },

        refreshAccessToken: async (): Promise<string | null> => {
          const refreshToken = get().getRefreshToken();
          if (!refreshToken) {
            get().clearTokens();
            get().clearAuthState();
            return null;
          }

          return tokenRefreshManager.refresh(async () => {
            try {
              const result = await authApi.refresh(refreshToken);

              if (result.success) {
                localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
                return result.data.accessToken;
              }

              get().clearTokens();
              get().clearAuthState();
              return null;
            } catch {
              get().clearTokens();
              get().clearAuthState();
              return null;
            }
          });
        },

        // Session management
        isSessionExpired: (): boolean => {
          const { lastActivity } = get();
          if (!lastActivity) return false;
          return Date.now() - lastActivity > SESSION_TIMEOUT;
        },

        // Initialize auth on app start
        initializeAuth: async (): Promise<void> => {
          if (get().isInitialized) return;

          set({ isInitialized: true, isLoading: true }, false, 'auth_initialized');

          const token = get().getAccessToken();
          if (!token) {
            set({ isLoading: false }, false, 'auth_no_token');
            return;
          }

          try {
            await get().refreshUser();
            set({ isLoading: false }, false, 'auth_init_success');
          } catch {
            get().clearAuthState();
            set({ isLoading: false }, false, 'auth_init_failed');
          }
        },

        // Session monitoring with cleanup
        startSessionMonitoring: (): (() => void) => {
          const interval = setInterval(() => {
            const { isSessionExpired, logout, isAuthenticated } = get();
            if (isAuthenticated && isSessionExpired()) {
              logout();
              window.location.href = '/login?reason=session_expired';
            }
          }, 60000);

          // Return cleanup function
          return () => clearInterval(interval);
        },

        // Activity tracking with cleanup
        startActivityTracking: (): (() => void) => {
          const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
          const updateActivity = () => {
            const { isAuthenticated, updateLastActivity } = get();
            if (isAuthenticated) {
              updateLastActivity();
            }
          };

          // Add event listeners
          events.forEach((event) => {
            window.addEventListener(event, updateActivity, { passive: true });
          });

          // Return cleanup function
          return () => {
            events.forEach((event) => {
              window.removeEventListener(event, updateActivity);
            });
          };
        },
      }),
      {
        name: 'unified-auth-storage',
        partialize: (state) => ({
          // Only persist non-sensitive data
          lastActivity: state.lastActivity,
          // Tokens are handled separately in localStorage
        }),
      }
    ),
    {
      name: 'unified-auth-store',
    }
  )
);

// Cleanup registry for managing all subscriptions
class CleanupRegistry {
  private cleanupFns = new Set<() => void>();

  register(fn: () => void) {
    this.cleanupFns.add(fn);
    return () => this.unregister(fn);
  }

  unregister(fn: () => void) {
    this.cleanupFns.delete(fn);
  }

  cleanup() {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.clear();
  }
}

export const authCleanupRegistry = new CleanupRegistry();

// Selector hooks for common use cases
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

// Export initialization state selector
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);
