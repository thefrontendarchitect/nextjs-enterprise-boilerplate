import { apiClient } from '@/shared/lib/api/config';
import { handleApiResponse, type ApiResult } from '@/shared/lib/api/client';
import { env } from '@/config/env';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from './types';

// Mock data for development
const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'Test User',
  avatar: '/avatar.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockTokens = {
  accessToken: 'mock-jwt-token-' + Math.random().toString(36).substring(7),
  refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substring(7),
};

export const authApi = {
  // Login user
  login: async (data: LoginRequest): Promise<ApiResult<LoginResponse>> => {
    // Use mock response in development
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store email for consistency across mock API calls
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user_email', data.email);
      }
      
      // Return mock successful login for any email/password
      return {
        success: true,
        data: {
          ...mockTokens,
          user: {
            ...mockUser,
            email: data.email, // Use the email from the form
          },
        },
      };
    }
    
    return handleApiResponse(() => 
      apiClient.post<LoginResponse>('auth/login', { json: data })
    );
  },
  
  // Logout user
  logout: async (): Promise<ApiResult<void>> => {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Clear mock user data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_user_email');
      }
      return { success: true, data: undefined };
    }
    
    return handleApiResponse(() => 
      apiClient.post<void>('auth/logout')
    );
  },
  
  // Refresh access token
  refresh: async (refreshToken: string): Promise<ApiResult<RefreshTokenResponse>> => {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        data: {
          accessToken: 'mock-jwt-token-refreshed-' + Math.random().toString(36).substring(7),
        },
      };
    }
    
    return handleApiResponse(() => 
      apiClient.post<RefreshTokenResponse>('auth/refresh', { 
        json: { refreshToken } 
      })
    );
  },
  
  // Register new user
  register: async (data: RegisterRequest): Promise<ApiResult<RegisterResponse>> => {
    return handleApiResponse(() => 
      apiClient.post<RegisterResponse>('auth/register', { json: data })
    );
  },
  
  // Request password reset
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResult<void>> => {
    return handleApiResponse(() => 
      apiClient.post<void>('auth/forgot-password', { json: data })
    );
  },
  
  // Reset password with token
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResult<void>> => {
    return handleApiResponse(() => 
      apiClient.post<void>('auth/reset-password', { json: data })
    );
  },
  
  // Verify email address
  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResult<void>> => {
    return handleApiResponse(() => 
      apiClient.post<void>('auth/verify-email', { json: data })
    );
  },
  
  // Get current user profile
  getMe: async (): Promise<ApiResult<LoginResponse['user']>> => {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockEmail = typeof window !== 'undefined' 
        ? localStorage.getItem('mock_user_email') || 'user@example.com'
        : 'user@example.com';
      return {
        success: true,
        data: {
          ...mockUser,
          email: mockEmail,
        },
      };
    }
    
    return handleApiResponse(() => 
      apiClient.get<LoginResponse['user']>('auth/me')
    );
  },
};