import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from './types';

/**
 * Mock user data for development/testing
 */
const createMockUser = (email?: string): User => ({
  id: 'user-123',
  email: email || 'user@example.com',
  name: 'Test User',
  avatar: '/avatar.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Generate mock JWT tokens
 */
const generateMockTokens = () => ({
  accessToken: 'mock-jwt-token-' + Math.random().toString(36).substring(7),
  refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substring(7),
});

/**
 * Mock API handlers for authentication endpoints
 */
export const authMockHandlers = {
  /**
   * Mock login handler
   * Simulates successful login for any email/password combination
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Store email for consistency across mock API calls
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user_email', data.email);
    }

    return {
      ...generateMockTokens(),
      user: createMockUser(data.email),
    };
  },

  /**
   * Mock logout handler
   */
  logout: async (): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Clear mock user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_user_email');
    }
  },

  /**
   * Mock token refresh handler
   */
  refresh: async (_refreshToken: string): Promise<RefreshTokenResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      accessToken: 'mock-jwt-token-refreshed-' + Math.random().toString(36).substring(7),
    };
  },

  /**
   * Mock user registration handler
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Store email for consistency
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user_email', data.email);
    }

    return {
      ...generateMockTokens(),
      user: createMockUser(data.email),
    };
  },

  /**
   * Mock forgot password handler
   */
  forgotPassword: async (_data: { email: string }): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    // In real implementation, this would send an email
  },

  /**
   * Mock password reset handler
   */
  resetPassword: async (_data: { token: string; password: string }): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 700));
    // In real implementation, this would validate token and update password
  },

  /**
   * Mock email verification handler
   */
  verifyEmail: async (_data: { token: string }): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    // In real implementation, this would validate and mark email as verified
  },

  /**
   * Mock get current user handler
   */
  getMe: async (): Promise<User> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockEmail =
      typeof window !== 'undefined'
        ? localStorage.getItem('mock_user_email') || 'user@example.com'
        : 'user@example.com';

    return createMockUser(mockEmail);
  },
};
