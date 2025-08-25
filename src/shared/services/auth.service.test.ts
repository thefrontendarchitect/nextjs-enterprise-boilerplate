import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from './auth.service';

// Mock the API client
vi.mock('@/shared/lib/api/client', () => ({
  createApi: vi.fn(() => ({
    post: vi.fn(),
    get: vi.fn(),
  })),
}));

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should store tokens on successful login', async () => {
      // Mock successful API response
      const mockTokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };
      
      const apiClient = await import('@/shared/lib/api/client');
      const mockPost = vi.fn().mockResolvedValue(mockTokens);
      (apiClient.createApi as any).mockReturnValue({
        post: mockPost,
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(localStorage.getItem('access_token')).toBe(mockTokens.accessToken);
      expect(localStorage.getItem('refresh_token')).toBe(mockTokens.refreshToken);
    });

    it('should handle login failure', async () => {
      const apiClient = await import('@/shared/lib/api/client');
      const mockPost = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
      (apiClient.createApi as any).mockReturnValue({
        post: mockPost,
      });

      const result = await authService.login('test@example.com', 'wrong-password');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid credentials');
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear tokens from localStorage', async () => {
      // Set some tokens
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');

      await authService.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('getAccessToken', () => {
    it('should return token from localStorage', () => {
      const testToken = 'test-access-token';
      localStorage.setItem('access_token', testToken);

      const token = authService.getAccessToken();

      expect(token).toBe(testToken);
    });

    it('should return null when no token exists', () => {
      const token = authService.getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('access_token', 'test-token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no access token exists', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});