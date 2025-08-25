/**
 * Central API types barrel export
 *
 * This file re-exports all API-related types from across the application
 * to provide a single source of truth for API type imports.
 */

// Core API types
export type { ApiResult, ApiError } from '@/shared/lib/api/client';
export type { Result } from '@/shared/lib/api/errors';

// Error types and codes
export { ErrorCodes, AppError, type ErrorCode } from '@/shared/lib/api/errors';

// Common schemas and validators
export {
  paginationSchema,
  errorResponseSchema,
  timestampSchema,
  createPaginatedSchema,
  validateResponse,
} from '@/shared/lib/api/validators';

// Mock API utilities
export {
  createMockWrapper,
  createVoidMockWrapper,
  isMockApiEnabled,
  mockDelays,
  isApiResult,
} from '@/shared/lib/api/mock-wrapper';

// Interceptor types
export type { RequestInterceptor, ResponseInterceptor } from '@/shared/lib/api/interceptors';

// Authentication types
export type {
  User,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/modules/auth/api/types';

// Auth schemas for validation
export {
  userSchema,
  loginResponseSchema,
  refreshTokenResponseSchema,
  registerResponseSchema,
} from '@/modules/auth/api/schemas';

/**
 * Common API response patterns
 */

/** Paginated response structure */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Generic success response */
export interface SuccessResponse<T = void> {
  success: true;
  data?: T;
  message?: string;
}

/** Generic error response */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

/** File upload response */
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/** Batch operation response */
export interface BatchOperationResponse<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  total: number;
  successCount: number;
  failureCount: number;
}
