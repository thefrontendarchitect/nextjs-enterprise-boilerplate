import { z } from 'zod';
import { AppError, ErrorCodes, logError } from '@/shared/lib/api/errors';

/**
 * Request validation interceptor
 *
 * Validates request data against a Zod schema before sending to the API.
 * Throws an AppError with VALIDATION_ERROR code if validation fails.
 *
 * @template T - The expected data type after validation
 * @param data - The data to validate
 * @param schema - The Zod schema to validate against
 * @returns The validated and typed data
 * @throws {AppError} When validation fails
 *
 * @example
 * ```typescript
 * const validatedData = validateRequest(formData, loginRequestSchema);
 * ```
 */
export function validateRequest<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Validation failed', ErrorCodes.VALIDATION_ERROR, 400, true, error.issues);
    }
    throw error;
  }
}

/**
 * Response validation interceptor
 *
 * Validates API response data against a Zod schema.
 * Logs validation errors and throws an AppError with INTERNAL_SERVER_ERROR code
 * if the response doesn't match the expected schema.
 *
 * @template T - The expected response type after validation
 * @param data - The response data to validate
 * @param schema - The Zod schema to validate against
 * @returns The validated and typed response data
 * @throws {AppError} When response validation fails
 *
 * @example
 * ```typescript
 * const user = validateResponse(response, userSchema);
 * ```
 */
export function validateResponse<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError(error, { context: 'Response validation failed', issues: error.issues });
      throw new AppError(
        'Invalid response format',
        ErrorCodes.INTERNAL_SERVER_ERROR,
        500,
        false,
        error.issues
      );
    }
    throw error;
  }
}

/**
 * Log requests in development
 *
 * Logs HTTP request details to the console in development mode.
 * Includes method, URL, and optional request data.
 * No-op in production.
 *
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - Request URL
 * @param data - Optional request payload
 *
 * @example
 * ```typescript
 * logRequest('POST', '/api/auth/login', { email, password });
 * ```
 */
export function logRequest(method: string, url: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚀 ${method} ${url}`);
    if (data) {
      console.log('Request data:', data);
    }
    console.groupEnd();
  }
}

/**
 * Log responses in development
 *
 * Logs HTTP response details to the console in development mode.
 * Uses emoji indicators for success/failure status.
 * No-op in production.
 *
 * @param method - HTTP method used in the request
 * @param url - Request URL
 * @param status - HTTP status code
 * @param data - Optional response data
 *
 * @example
 * ```typescript
 * logResponse('POST', '/api/auth/login', 200, { user, token });
 * ```
 */
export function logResponse(method: string, url: string, status: number, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    const emoji = status >= 200 && status < 300 ? '✅' : '❌';
    console.group(`${emoji} ${method} ${url} - ${status}`);
    if (data) {
      console.log('Response data:', data);
    }
    console.groupEnd();
  }
}

/**
 * Transform response data
 *
 * Applies an optional transformation function to response data.
 * If no transformer is provided, returns the data as-is with type casting.
 *
 * @template T - The expected type after transformation
 * @param data - The raw response data
 * @param transformer - Optional function to transform the data
 * @returns The transformed data
 *
 * @example
 * ```typescript
 * const users = transformResponse(response, (data) =>
 *   data.items.map(item => new User(item))
 * );
 * ```
 */
export function transformResponse<T>(data: unknown, transformer?: (data: unknown) => T): T {
  if (transformer) {
    return transformer(data);
  }
  return data as T;
}

/**
 * Enhanced request interceptor
 *
 * Interface for intercepting and modifying requests before they are sent.
 * Can be used to add headers, authentication tokens, or modify request config.
 *
 * @interface RequestInterceptor
 * @property {Function} onRequest - Called before request is sent, can modify config
 * @property {Function} onRequestError - Called when request preparation fails
 *
 * @example
 * ```typescript
 * const authInterceptor: RequestInterceptor = {
 *   onRequest: async (config) => {
 *     config.headers.set('Authorization', `Bearer ${token}`);
 *     return config;
 *   },
 *   onRequestError: (error) => console.error('Request failed:', error)
 * };
 * ```
 */
export interface RequestInterceptor {
  onRequest?: (config: RequestInit) => RequestInit | Promise<RequestInit>;
  onRequestError?: (error: Error) => void;
}

/**
 * Enhanced response interceptor
 *
 * Interface for intercepting and processing responses after they are received.
 * Can be used to handle errors, refresh tokens, or transform responses.
 *
 * @interface ResponseInterceptor
 * @property {Function} onResponse - Called after response is received, can modify response
 * @property {Function} onResponseError - Called when response processing fails
 *
 * @example
 * ```typescript
 * const errorInterceptor: ResponseInterceptor = {
 *   onResponse: async (response) => {
 *     if (response.status === 401) {
 *       await refreshToken();
 *     }
 *     return response;
 *   },
 *   onResponseError: (error) => handleNetworkError(error)
 * };
 * ```
 */
export interface ResponseInterceptor {
  onResponse?: (response: Response) => Response | Promise<Response>;
  onResponseError?: (error: Error) => void;
}

/**
 * Create request with interceptors
 *
 * Creates and executes an HTTP request with support for request/response interceptors.
 * Applies interceptors in sequence: request interceptor → fetch → response interceptor.
 * Automatically adds Content-Type header for JSON payloads if not set.
 *
 * @param url - The request URL
 * @param options - Fetch API options (method, headers, body, etc.)
 * @param interceptors - Optional request and response interceptors
 * @returns Promise resolving to the Response object
 * @throws {Error} When request fails or interceptors throw
 *
 * @example
 * ```typescript
 * const response = await createInterceptedRequest(
 *   '/api/users',
 *   { method: 'POST', body: JSON.stringify(userData) },
 *   { request: authInterceptor, response: errorInterceptor }
 * );
 * ```
 *
 * Request flow:
 * 1. Apply request interceptor (if provided)
 * 2. Add default headers (Content-Type)
 * 3. Log request (in development)
 * 4. Execute fetch request
 * 5. Apply response interceptor (if provided)
 * 6. Log response (in development)
 * 7. Return processed response
 */
export async function createInterceptedRequest(
  url: string,
  options: RequestInit = {},
  interceptors: {
    request?: RequestInterceptor;
    response?: ResponseInterceptor;
  } = {}
): Promise<Response> {
  let config = { ...options };

  // Apply request interceptor
  if (interceptors.request?.onRequest) {
    try {
      config = await interceptors.request.onRequest(config);
    } catch (error) {
      if (interceptors.request?.onRequestError) {
        interceptors.request.onRequestError(error as Error);
      }
      throw error;
    }
  }

  // Add default headers
  const headers = new Headers(config.headers);

  // Set content type if not set
  if (!headers.has('Content-Type') && config.body) {
    headers.set('Content-Type', 'application/json');
  }

  config.headers = headers;

  // Log request
  logRequest(config.method || 'GET', url, config.body);

  try {
    // Make request
    let response = await fetch(url, config);

    // Apply response interceptor
    if (interceptors.response?.onResponse) {
      response = await interceptors.response.onResponse(response);
    }

    // Log response
    logResponse(
      config.method || 'GET',
      url,
      response.status,
      response.headers.get('Content-Type')?.includes('application/json')
        ? await response.clone().json()
        : undefined
    );

    return response;
  } catch (error) {
    if (interceptors.response?.onResponseError) {
      interceptors.response.onResponseError(error as Error);
    }
    throw error;
  }
}

/**
 * Rate limiting interceptor
 *
 * Implements client-side rate limiting to prevent excessive API requests.
 * Tracks requests per endpoint within a sliding time window.
 * Throws an error when rate limit is exceeded.
 *
 * @class RateLimiter
 * @param {number} maxRequests - Maximum requests allowed per window (default: 10)
 * @param {number} windowMs - Time window in milliseconds (default: 60000ms = 1 minute)
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter(5, 10000); // 5 requests per 10 seconds
 *
 * // Before making a request
 * await limiter.checkLimit('/api/users');
 * const response = await fetch('/api/users');
 *
 * // Reset limits if needed
 * limiter.reset('/api/users'); // Reset specific endpoint
 * limiter.reset(); // Reset all endpoints
 * ```
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(endpoint: string): Promise<void> {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      throw new AppError('Rate limit exceeded', ErrorCodes.RATE_LIMIT_EXCEEDED, 429, true);
    }

    validRequests.push(now);
    this.requests.set(endpoint, validRequests);
  }

  reset(endpoint?: string): void {
    if (endpoint) {
      this.requests.delete(endpoint);
    } else {
      this.requests.clear();
    }
  }
}
