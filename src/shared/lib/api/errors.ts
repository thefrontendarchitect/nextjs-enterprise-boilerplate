export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',

  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode?: number,
    isOperational = true,
    public readonly details?: unknown,
    public readonly requestId?: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.isOperational = isOperational;
    this.timestamp = new Date();
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static fromHttpStatus(
    status: number,
    message?: string,
    details?: unknown,
    requestId?: string
  ): AppError {
    const statusMap: Record<number, { code: ErrorCode; message: string; retryable: boolean }> = {
      400: { code: ErrorCodes.BAD_REQUEST, message: 'Invalid request data', retryable: false },
      401: { code: ErrorCodes.UNAUTHORIZED, message: 'Authentication required', retryable: false },
      403: { code: ErrorCodes.FORBIDDEN, message: 'Access denied', retryable: false },
      404: { code: ErrorCodes.NOT_FOUND, message: 'Resource not found', retryable: false },
      409: { code: ErrorCodes.CONFLICT, message: 'Resource conflict', retryable: false },
      429: { code: ErrorCodes.RATE_LIMIT_EXCEEDED, message: 'Too many requests', retryable: true },
      500: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        retryable: true,
      },
      502: {
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: 'Service temporarily unavailable',
        retryable: true,
      },
      503: {
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: 'Service unavailable',
        retryable: true,
      },
      504: { code: ErrorCodes.TIMEOUT, message: 'Request timeout', retryable: true },
    };

    const errorInfo = statusMap[status] || {
      code: ErrorCodes.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
      retryable: false,
    };

    return new AppError(
      message || errorInfo.message,
      errorInfo.code,
      status,
      true,
      details,
      requestId,
      errorInfo.retryable
    );
  }

  static networkError(message?: string): AppError {
    return new AppError(
      message || 'Network connection failed',
      ErrorCodes.NETWORK_ERROR,
      undefined,
      true,
      undefined,
      undefined,
      true
    );
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      requestId: this.requestId,
      retryable: this.retryable,
    };
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

export function getErrorCode(error: unknown): ErrorCode {
  if (error instanceof AppError) {
    return error.code;
  }

  return ErrorCodes.UNKNOWN_ERROR;
}

export function normalizeError(error: unknown): AppError {
  // Already normalized
  if (error instanceof AppError) {
    return error;
  }

  // Standard JavaScript errors
  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      return new AppError('Request was cancelled', ErrorCodes.NETWORK_ERROR, undefined, true, {
        cancelled: true,
      });
    }

    if (error.name === 'TimeoutError') {
      return new AppError('Request timed out', ErrorCodes.TIMEOUT, 504, true);
    }

    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return AppError.networkError(error.message);
    }

    if (error.name === 'ValidationError') {
      return new AppError(error.message, ErrorCodes.VALIDATION_ERROR, 400, true, {
        stack: error.stack,
      });
    }

    // Generic error handling
    return new AppError(error.message, ErrorCodes.UNKNOWN_ERROR, 500, false, {
      originalError: error.name,
      stack: error.stack,
    });
  }

  // Handle error-like objects
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // HTTP status errors
    if ('status' in err || 'statusCode' in err) {
      const statusCode = Number(err.status || err.statusCode);
      const message = String(err.message || err.error || 'API Error');
      return AppError.fromHttpStatus(statusCode, message, err);
    }

    // Axios-like errors
    if ('response' in err && typeof err.response === 'object' && err.response !== null) {
      const response = err.response as Record<string, unknown>;
      const statusCode = Number(response.status || 500);
      const data = response.data as Record<string, unknown> | undefined;
      const message = String(data?.message || err.message || 'Request failed');
      return AppError.fromHttpStatus(statusCode, message, data);
    }

    // Fetch-like errors
    if ('ok' in err && err.ok === false) {
      const statusCode = Number(err.status || 500);
      const message = String(err.statusText || 'Request failed');
      return AppError.fromHttpStatus(statusCode, message, err);
    }

    // Custom error objects with code and message
    if ('code' in err && 'message' in err) {
      const code = String(err.code);
      const message = String(err.message);
      const statusCode = err.statusCode ? Number(err.statusCode) : 500;

      // Map known error codes
      const errorCode = Object.values(ErrorCodes).includes(code as any)
        ? (code as ErrorCode)
        : ErrorCodes.UNKNOWN_ERROR;

      return new AppError(message, errorCode, statusCode, true, err.details);
    }

    // GraphQL errors
    if ('errors' in err && Array.isArray(err.errors)) {
      const firstError = err.errors[0];
      const message = firstError?.message || 'GraphQL error';
      return new AppError(message, ErrorCodes.BAD_REQUEST, 400, true, { errors: err.errors });
    }
  }

  // String errors
  if (typeof error === 'string') {
    // Check for known error patterns
    if (error.toLowerCase().includes('unauthorized')) {
      return new AppError(error, ErrorCodes.UNAUTHORIZED, 401, true);
    }
    if (error.toLowerCase().includes('forbidden')) {
      return new AppError(error, ErrorCodes.FORBIDDEN, 403, true);
    }
    if (error.toLowerCase().includes('not found')) {
      return new AppError(error, ErrorCodes.NOT_FOUND, 404, true);
    }
    if (error.toLowerCase().includes('timeout')) {
      return new AppError(error, ErrorCodes.TIMEOUT, 504, true);
    }
    if (error.toLowerCase().includes('network')) {
      return AppError.networkError(error);
    }

    return new AppError(error, ErrorCodes.UNKNOWN_ERROR, 500, false);
  }

  // Number errors (HTTP status codes)
  if (typeof error === 'number') {
    return AppError.fromHttpStatus(error);
  }

  // Fallback for unknown error types
  return new AppError('An unexpected error occurred', ErrorCodes.UNKNOWN_ERROR, 500, false, {
    originalError: error,
  });
}

export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

export function getUserFriendlyMessage(error: unknown): string {
  const appError = normalizeError(error);

  const userMessages: Record<ErrorCode, string> = {
    [ErrorCodes.UNAUTHORIZED]: 'Please log in to continue',
    [ErrorCodes.FORBIDDEN]: "You don't have permission to perform this action",
    [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
    [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',
    [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again',
    [ErrorCodes.INVALID_INPUT]: 'Invalid input provided',
    [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields',
    [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
    [ErrorCodes.ALREADY_EXISTS]: 'This item already exists',
    [ErrorCodes.CONFLICT]: 'There was a conflict with your request',
    [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your connection',
    [ErrorCodes.TIMEOUT]: 'Request timed out. Please try again',
    [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
    [ErrorCodes.INTERNAL_SERVER_ERROR]: 'Something went wrong. Please try again',
    [ErrorCodes.DATABASE_ERROR]: 'Database error. Please try again',
    [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'External service error. Please try again',
    [ErrorCodes.SERVER_ERROR]: 'Server error. Please try again',
    [ErrorCodes.BAD_REQUEST]: 'Invalid request. Please try again',
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please slow down',
    [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred',
  };

  return userMessages[appError.code as ErrorCode] || appError.message;
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
  const appError = normalizeError(error);

  const logData = {
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    isOperational: appError.isOperational,
    timestamp: appError.timestamp,
    stack: appError.stack,
    details: appError.details,
    context,
  };

  if (appError.isOperational) {
    console.warn('Operational Error:', logData);
  } else {
    console.error('Programming Error:', logData);
  }

  if (process.env.NODE_ENV === 'production') {
    import('@/shared/lib/monitoring/sentry').then(({ captureException }) => {
      captureException(appError, { extra: logData });
    });
  }
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = AppError> = { success: true; data: T } | { success: false; error: E };

/**
 * Create a success result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Create a failure result
 */
export function failure<E = AppError>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Try-catch wrapper that returns Result
 */
export async function tryCatch<T>(fn: () => Promise<T> | T): Promise<Result<T>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(normalizeError(error));
  }
}
