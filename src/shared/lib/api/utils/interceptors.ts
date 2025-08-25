import type { BeforeRequestHook, AfterResponseHook } from 'ky';

// Request interceptor to add common headers
export const addCommonHeaders: BeforeRequestHook = async (request) => {
  // Add request ID for tracing
  if (!request.headers.has('X-Request-ID')) {
    const requestId = crypto.randomUUID();
    request.headers.set('X-Request-ID', requestId);
  }
  
  // Add content type if not set
  if (!request.headers.has('Content-Type') && request.method !== 'GET') {
    request.headers.set('Content-Type', 'application/json');
  }
  
  // Add app version for API versioning
  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    request.headers.set('X-App-Version', process.env.NEXT_PUBLIC_APP_VERSION);
  }
};

// Response interceptor for logging
export const logResponse: AfterResponseHook = async (request, _options, response) => {
  const requestId = request.headers.get('X-Request-ID');
  
  if (process.env.NODE_ENV === 'development') {
    const method = request.method;
    const url = request.url;
    const status = response.status;
    
    console.log(`[API] ${method} ${url} - ${status} (${requestId})`);
  }
  
  // Track API metrics (could integrate with analytics here)
  if (typeof window !== 'undefined' && window.performance) {
    // const duration = performance.now();
    // Could send to analytics service
  }
};

// Retry predicate to determine if request should be retried
export const shouldRetry = (error: unknown): boolean => {
  if (error instanceof Response) {
    // Retry on server errors and rate limiting
    return [429, 500, 502, 503, 504].includes(error.status);
  }
  
  // Retry on network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  return false;
};