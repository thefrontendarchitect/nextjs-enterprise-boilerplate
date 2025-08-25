import type { ApiResult } from './client';
import { AppError } from './errors';
import { env } from '@/config/env';

/**
 * Configuration options for mock API wrapper
 */
interface MockWrapperOptions {
  /** Delay in milliseconds to simulate network latency */
  delay?: number;
  /** Whether to use mock API based on environment */
  enabled?: boolean;
}

/**
 * Creates a consistent wrapper for handling mock and real API calls
 *
 * @template TData - The expected response data type
 * @template TArgs - The function arguments type
 *
 * @param mockHandler - The mock implementation that returns the data directly
 * @param realHandler - The real API implementation that returns ApiResult
 * @param options - Configuration options for the mock wrapper
 *
 * @returns A function that returns ApiResult<TData> consistently
 *
 * @example
 * ```typescript
 * const login = createMockWrapper(
 *   authMockHandlers.login,
 *   async (data) => handleApiResponse(async () => {
 *     const response = await apiClient.post('auth/login', { json: data });
 *     return validateResponse(response, loginResponseSchema);
 *   }),
 *   { delay: 500 }
 * );
 * ```
 */
export function createMockWrapper<TData, TArgs extends unknown[]>(
  mockHandler: (...args: TArgs) => Promise<TData>,
  realHandler: (...args: TArgs) => Promise<ApiResult<TData>>,
  options: MockWrapperOptions = {}
): (...args: TArgs) => Promise<ApiResult<TData>> {
  // In production, always use real handler directly
  if (process.env.NODE_ENV === 'production') {
    return realHandler;
  }

  const { delay = 300, enabled = env.NEXT_PUBLIC_USE_MOCK_API } = options;

  return async (...args: TArgs): Promise<ApiResult<TData>> => {
    // Use mock implementation if enabled
    if (enabled) {
      try {
        // Add configurable delay if specified (development only)
        if (delay > 0 && process.env.NODE_ENV !== 'production') {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Execute mock handler and wrap in success result
        const data = await mockHandler(...args);
        return { success: true, data };
      } catch (error) {
        // Even mock handlers can fail - handle gracefully
        return {
          success: false,
          error: error as AppError,
        };
      }
    }

    // Use real implementation
    return realHandler(...args);
  };
}

/**
 * Creates a mock wrapper for void/empty responses
 *
 * @param mockHandler - The mock implementation that returns void
 * @param realHandler - The real API implementation
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * const logout = createVoidMockWrapper(
 *   authMockHandlers.logout,
 *   async () => handleApiResponse(() => apiClient.post('auth/logout'))
 * );
 * ```
 */
export function createVoidMockWrapper<TArgs extends unknown[]>(
  mockHandler: (...args: TArgs) => Promise<void>,
  realHandler: (...args: TArgs) => Promise<ApiResult<void>>,
  options: MockWrapperOptions = {}
): (...args: TArgs) => Promise<ApiResult<void>> {
  // In production, always use real handler directly
  if (process.env.NODE_ENV === 'production') {
    return realHandler;
  }

  return createMockWrapper<void, TArgs>(mockHandler, realHandler, options);
}

/**
 * Utility to check if mock API is enabled
 */
export function isMockApiEnabled(): boolean {
  return env.NEXT_PUBLIC_USE_MOCK_API === true;
}

/**
 * Helper to create consistent mock delays across the application
 */
export const mockDelays =
  process.env.NODE_ENV === 'production'
    ? ({
        /** No delays in production */
        fast: 0,
        standard: 0,
        slow: 0,
        network: 0,
      } as const)
    : ({
        /** Fast operations like token refresh */
        fast: 200,
        /** Standard operations like login/logout */
        standard: 500,
        /** Slower operations like registration */
        slow: 800,
        /** Simulated network issues */
        network: 2000,
      } as const);

/**
 * Type guard to check if a response is an ApiResult
 */
export function isApiResult<T>(response: unknown): response is ApiResult<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response.success === true || response.success === false)
  );
}
