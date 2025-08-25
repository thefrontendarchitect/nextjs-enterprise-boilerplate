import ky, {
  type Options,
  type BeforeRequestHook,
  type AfterResponseHook,
  type BeforeRetryHook,
  HTTPError,
} from 'ky';
import { AppError, ErrorCodes } from './errors';

/**
 * API Result type for consistent error handling
 *
 * All API calls return this discriminated union type, allowing for
 * type-safe error handling without try-catch blocks.
 *
 * @template T - The expected data type on success
 *
 * @example
 * ```typescript
 * const result = await api.getUser(id);
 * if (result.success) {
 *   console.log(result.data); // Type-safe access to user data
 * } else {
 *   console.error(result.error); // Type-safe access to error
 * }
 * ```
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError; fallback?: T };

// Re-export for backward compatibility
export type ApiError = AppError;

/**
 * Configuration options for creating an API client instance
 *
 * @interface CreateApiOptions
 * @property {string} baseUrl - Base URL for all API requests
 * @property {Function} getAccessToken - Function to retrieve the current access token
 * @property {Function} refreshAccessToken - Function to refresh the access token
 * @property {Function} onUnauthorized - Callback when 401 response is received after all retries
 * @property {Function} onError - Global error handler for all API errors
 * @property {AbortSignal} signal - Optional AbortSignal for request cancellation
 */
interface CreateApiOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
  refreshAccessToken?: () => Promise<string | null>;
  onUnauthorized?: () => Promise<void> | void;
  onError?: (error: ApiError) => void;
  signal?: AbortSignal;
}

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Request Deduplication
 *
 * Prevents duplicate concurrent requests to the same endpoint.
 * If a request is already in flight, returns the existing promise.
 * Cached for a configurable TTL after completion.
 *
 * @template T - The expected response type
 * @param key - Unique key for the request (usually method + URL + params)
 * @param fn - The function that makes the actual request
 * @param ttl - Time to live in milliseconds for the cache (default: 1000ms)
 * @returns Promise resolving to the response data
 *
 * @example
 * ```typescript
 * // Both calls will share the same network request
 * const [user1, user2] = await Promise.all([
 *   dedupedRequest('GET:/api/user/123', () => fetch('/api/user/123')),
 *   dedupedRequest('GET:/api/user/123', () => fetch('/api/user/123'))
 * ]);
 * ```
 */
function dedupedRequest<T>(key: string, fn: () => Promise<T>, ttl: number = 1000): Promise<T> {
  // Check if we have a pending request for this key
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // Create new request and store it
  const promise = fn().finally(() => {
    // Remove from cache after TTL
    setTimeout(() => pendingRequests.delete(key), ttl);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Creates a configured API client instance
 *
 * This factory function creates an API client with:
 * - Automatic token injection
 * - Request/response interceptors
 * - Request deduplication for GET requests
 * - Automatic retry with exponential backoff
 * - Request ID tracking for debugging
 *
 * @param options - Configuration options for the API client
 * @returns Configured API client with HTTP methods
 *
 * @example
 * ```typescript
 * const api = createApi({
 *   baseUrl: 'https://api.example.com',
 *   getAccessToken: () => localStorage.getItem('token'),
 *   onUnauthorized: () => router.push('/login')
 * });
 *
 * const user = await api.get<User>('users/123');
 * ```
 *
 * Request Flow:
 * 1. Deduplicate GET requests
 * 2. Add auth token and request ID
 * 3. Execute request with retry logic
 * 4. On 401: Refresh token and retry (via beforeRetry hook)
 * 5. If refresh fails: Call onUnauthorized and logout
 * 6. Return typed response
 */
export const createApi = ({
  baseUrl,
  getAccessToken,
  refreshAccessToken,
  onUnauthorized,
  signal: globalSignal,
}: CreateApiOptions) => {
  const beforeRequest: BeforeRequestHook = async (request) => {
    const token = await getAccessToken?.();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    // Add request ID for tracing
    const requestId = crypto.randomUUID();
    request.headers.set('X-Request-ID', requestId);
  };

  const beforeRetry: BeforeRetryHook = async ({ request, error, retryCount }) => {
    // Only retry 401 errors once with token refresh
    if (error instanceof HTTPError && error.response.status === 401 && retryCount === 1) {
      if (refreshAccessToken) {
        try {
          // Try to refresh the token
          const newToken = await refreshAccessToken();
          if (newToken) {
            // Update the request with the new token
            request.headers.set('Authorization', `Bearer ${newToken}`);
            return;
          }
        } catch (refreshError) {
          // If refresh fails, stop retrying and let onUnauthorized handle it
          throw refreshError;
        }
      }
      // If no refresh function or refresh returned null, stop retrying
      throw new Error('Unable to refresh authentication token');
    }
  };

  const afterResponse: AfterResponseHook = async (_request, _options, response) => {
    // Only call onUnauthorized if all retries have failed
    if (response.status === 401) {
      // This will only be called if beforeRetry couldn't refresh the token
      await onUnauthorized?.();
    }
  };

  const options: Options = {
    prefixUrl: baseUrl,
    hooks: {
      beforeRequest: [beforeRequest],
      beforeRetry: [beforeRetry],
      afterResponse: [afterResponse],
    },
    retry: {
      limit: 3,
      methods: ['get', 'put', 'post', 'patch', 'delete'],
      statusCodes: [401, 408, 429, 500, 502, 503, 504],
      backoffLimit: 20000,
    },
    timeout: 30000,
    signal: globalSignal,
  };

  const instance = ky.create(options);

  // Wrapper with deduplication and cancellation support
  const wrappedInstance = {
    get: async <T>(url: string, options?: Options & { signal?: AbortSignal }): Promise<T> => {
      // Merge signals if both provided
      const signal = options?.signal || globalSignal;
      const mergedOptions = { ...options, signal };

      // Deduplicate GET requests
      const cacheKey = `GET:${url}:${JSON.stringify(options?.searchParams || {})}`;
      return dedupedRequest(
        cacheKey,
        () => instance.get(url, mergedOptions).json<T>(),
        5000 // Cache GET requests for 5 seconds
      );
    },
    post: async <T>(url: string, options?: Options & { signal?: AbortSignal }): Promise<T> => {
      const signal = options?.signal || globalSignal;
      const mergedOptions = { ...options, signal };
      return instance.post(url, mergedOptions).json<T>();
    },
    put: async <T>(url: string, options?: Options & { signal?: AbortSignal }): Promise<T> => {
      const signal = options?.signal || globalSignal;
      const mergedOptions = { ...options, signal };
      return instance.put(url, mergedOptions).json<T>();
    },
    patch: async <T>(url: string, options?: Options & { signal?: AbortSignal }): Promise<T> => {
      const signal = options?.signal || globalSignal;
      const mergedOptions = { ...options, signal };
      return instance.patch(url, mergedOptions).json<T>();
    },
    delete: async <T>(url: string, options?: Options & { signal?: AbortSignal }): Promise<T> => {
      const signal = options?.signal || globalSignal;
      const mergedOptions = { ...options, signal };
      return instance.delete(url, mergedOptions).json<T>();
    },
  };

  return wrappedInstance;
};

/**
 * Helper function to handle API responses with consistent error handling
 *
 * Wraps any async API call in a try-catch block and returns a standardized
 * ApiResult. Automatically normalizes errors to AppError instances and
 * handles different error types (network, HTTP, validation, etc.).
 *
 * @template T - The expected response data type
 * @param apiCall - Async function that makes the API call
 * @returns Promise resolving to ApiResult<T>
 *
 * @example
 * ```typescript
 * // Instead of try-catch blocks:
 * const result = await handleApiResponse(async () => {
 *   const response = await fetch('/api/users');
 *   return response.json();
 * });
 *
 * if (result.success) {
 *   console.log('Users:', result.data);
 * } else {
 *   console.error('Failed:', result.error.message);
 * }
 * ```
 *
 * Error handling flow:
 * 1. Execute the API call
 * 2. On success: Return { success: true, data }
 * 3. On error:
 *    - Check if already an AppError
 *    - Convert HTTP errors to AppError with proper code
 *    - Handle network errors specially
 *    - Normalize unknown errors
 *    - Return { success: false, error }
 */
export async function handleApiResponse<T>(
  apiCall: () => Promise<T>,
  signal?: AbortSignal
): Promise<ApiResult<T>> {
  try {
    // Check if already aborted
    if (signal?.aborted) {
      throw new AppError('Request was cancelled', ErrorCodes.NETWORK_ERROR, undefined, true, {
        cancelled: true,
      });
    }

    const data = await apiCall();
    return { success: true, data };
  } catch (error: unknown) {
    let appError: AppError;

    // Handle abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      appError = new AppError('Request was cancelled', ErrorCodes.NETWORK_ERROR, undefined, true, {
        cancelled: true,
      });
    } else if (error instanceof AppError) {
      appError = error;
    } else if ((error as any).response?.status) {
      const err = error as any;
      const errorData = err.response?.data;
      appError = AppError.fromHttpStatus(
        err.response.status,
        errorData?.message || err.message,
        errorData,
        err.response?.headers?.get('X-Request-ID')
      );
    } else if (
      (error as any).name === 'NetworkError' ||
      (error as any).message?.includes('network')
    ) {
      appError = AppError.networkError((error as any).message);
    } else {
      appError = new AppError(
        (error as any).message || 'An unexpected error occurred',
        ErrorCodes.UNKNOWN_ERROR,
        undefined,
        false,
        error
      );
    }

    return { success: false, error: appError };
  }
}
