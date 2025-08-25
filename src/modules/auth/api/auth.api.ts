import { apiClient } from '@/shared/lib/api/config';
import { handleApiResponse } from '@/shared/lib/api/client';
import { validateResponse } from '@/shared/lib/api/validators';
import {
  createMockWrapper,
  createVoidMockWrapper,
  mockDelays,
} from '@/shared/lib/api/mock-wrapper';
import { authMockHandlers } from './auth.api.mock';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from './types';
import {
  loginResponseSchema,
  refreshTokenResponseSchema,
  registerResponseSchema,
  userSchema,
} from './schemas';

export const authApi = {
  // Login user
  login: createMockWrapper(
    authMockHandlers.login,
    async (data: LoginRequest) =>
      handleApiResponse(async () => {
        const response = await apiClient.post('auth/login', { json: data });
        return validateResponse(response, loginResponseSchema, 'login');
      }),
    { delay: mockDelays.standard }
  ),

  // Logout user
  logout: createVoidMockWrapper(
    authMockHandlers.logout,
    async () => handleApiResponse(() => apiClient.post<void>('auth/logout')),
    { delay: mockDelays.fast }
  ),

  // Refresh access token
  refresh: createMockWrapper(
    authMockHandlers.refresh,
    async (refreshToken: string) =>
      handleApiResponse(async () => {
        const response = await apiClient.post('auth/refresh', {
          json: { refreshToken },
        });
        return validateResponse(response, refreshTokenResponseSchema, 'refresh token');
      }),
    { delay: mockDelays.fast }
  ),

  // Register new user
  register: createMockWrapper(
    authMockHandlers.register,
    async (data: RegisterRequest) =>
      handleApiResponse(async () => {
        const response = await apiClient.post('auth/register', { json: data });
        return validateResponse(response, registerResponseSchema, 'register');
      }),
    { delay: mockDelays.slow }
  ),

  // Request password reset
  forgotPassword: createVoidMockWrapper(
    authMockHandlers.forgotPassword,
    async (data: ForgotPasswordRequest) =>
      handleApiResponse(() => apiClient.post<void>('auth/forgot-password', { json: data })),
    { delay: mockDelays.standard }
  ),

  // Reset password with token
  resetPassword: createVoidMockWrapper(
    authMockHandlers.resetPassword,
    async (data: ResetPasswordRequest) =>
      handleApiResponse(() => apiClient.post<void>('auth/reset-password', { json: data })),
    { delay: mockDelays.standard }
  ),

  // Verify email address
  verifyEmail: createVoidMockWrapper(
    authMockHandlers.verifyEmail,
    async (data: VerifyEmailRequest) =>
      handleApiResponse(() => apiClient.post<void>('auth/verify-email', { json: data })),
    { delay: mockDelays.fast }
  ),

  // Get current user profile
  getMe: createMockWrapper(
    authMockHandlers.getMe,
    async () =>
      handleApiResponse(async () => {
        const response = await apiClient.get('auth/me');
        return validateResponse(response, userSchema, 'user profile');
      }),
    { delay: mockDelays.fast }
  ),
};
