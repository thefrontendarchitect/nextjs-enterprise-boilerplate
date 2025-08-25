import ky, { type Options, type BeforeRequestHook, type AfterResponseHook } from 'ky';

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
};

export type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError; fallback?: T };

interface CreateApiOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
  onUnauthorized?: () => Promise<void> | void;
  onError?: (error: ApiError) => void;
}

// Circuit breaker implementation
class CircuitBreaker {
  private failures = 0;
  private lastFailTime?: number;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly threshold = 5;
  private readonly resetTimeout = 60000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open' && !this.shouldAttemptReset()) {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }

    if (this.state === 'open') {
      this.state = 'half-open';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return this.lastFailTime ? Date.now() - this.lastFailTime > this.resetTimeout : false;
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

const circuitBreaker = new CircuitBreaker();

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

function dedupedRequest<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 1000
): Promise<T> {
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

export const createApi = ({ 
  baseUrl, 
  getAccessToken, 
  onUnauthorized
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

  const afterResponse: AfterResponseHook = async (_request, _options, response) => {
    if (response.status === 401) {
      await onUnauthorized?.();
    }
  };

  const options: Options = {
    prefixUrl: baseUrl,
    hooks: {
      beforeRequest: [beforeRequest],
      afterResponse: [afterResponse],
    },
    retry: {
      limit: 3,
      methods: ['get', 'put', 'post', 'patch', 'delete'],
      statusCodes: [408, 429, 500, 502, 503, 504],
      backoffLimit: 20000,
    },
    timeout: 30000,
  };

  const instance = ky.create(options);

  // Wrapper with circuit breaker and deduplication
  const wrappedInstance = {
    get: async <T>(url: string, options?: Options): Promise<T> => {
      // Deduplicate GET requests
      const cacheKey = `GET:${url}:${JSON.stringify(options?.searchParams || {})}`;
      return dedupedRequest(
        cacheKey,
        () => circuitBreaker.execute(() => instance.get(url, options).json<T>()),
        5000 // Cache GET requests for 5 seconds
      );
    },
    post: async <T>(url: string, options?: Options): Promise<T> => {
      // Don't deduplicate POST requests
      return circuitBreaker.execute(() => instance.post(url, options).json<T>());
    },
    put: async <T>(url: string, options?: Options): Promise<T> => {
      // Don't deduplicate PUT requests
      return circuitBreaker.execute(() => instance.put(url, options).json<T>());
    },
    patch: async <T>(url: string, options?: Options): Promise<T> => {
      // Don't deduplicate PATCH requests
      return circuitBreaker.execute(() => instance.patch(url, options).json<T>());
    },
    delete: async <T>(url: string, options?: Options): Promise<T> => {
      // Don't deduplicate DELETE requests
      return circuitBreaker.execute(() => instance.delete(url, options).json<T>());
    },
  };

  return wrappedInstance;
};

// Helper function to handle API responses
export async function handleApiResponse<T>(
  apiCall: () => Promise<T>
): Promise<ApiResult<T>> {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error: any) {
    const apiError: ApiError = {
      code: error.response?.status?.toString() || 'UNKNOWN',
      message: error.message || 'An unexpected error occurred',
      details: error.response?.data,
      requestId: error.response?.headers?.get('X-Request-ID'),
    };
    
    return { success: false, error: apiError };
  }
}