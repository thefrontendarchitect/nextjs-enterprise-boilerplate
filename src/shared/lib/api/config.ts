import { createApi } from './client';
import { env } from '@/config/env';
import { logError } from './errors';

// Get auth store lazily to avoid circular dependencies
const getAuthStore = () => {
  if (typeof window === 'undefined') return null;

  // Dynamic import to avoid circular dependency
  const { useAuthStore } = require('@/modules/auth/stores/unified-auth-store');
  return useAuthStore.getState();
};

// Create a singleton API client instance with shared configuration
export const apiClient = createApi({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getAccessToken: () => {
    const authStore = getAuthStore();
    return authStore ? authStore.getAccessToken() : null;
  },
  refreshAccessToken: async () => {
    const authStore = getAuthStore();
    if (authStore) {
      return await authStore.refreshAccessToken();
    }
    return null;
  },
  onUnauthorized: async () => {
    // This is only called after all retries fail (including token refresh)
    const authStore = getAuthStore();
    if (authStore) {
      // Clear auth state and redirect to login
      authStore.clearAuthState();
      authStore.clearTokens();
      window.location.href = '/login?reason=session_expired';
    }
  },
  onError: (error) => {
    // Central error logging
    logError(error, { context: 'API call failed' });
  },
});
