import { createApi } from './client';
import { env } from '@/config/env';

// Create a singleton API client instance with shared configuration
export const apiClient = createApi({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },
  onUnauthorized: async () => {
    // Handle token refresh or redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  },
  onError: (error) => {
    // Central error logging - could integrate with Sentry here
    console.error('API Error:', error);
  },
});