/**
 * Standardized error handling utilities
 */

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    isOperational = true,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.isOperational = isOperational;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error codes for consistent error handling
 */
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
  
  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Convert unknown errors to AppError
 */
export function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }
  
  // Standard Error
  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorCodes.UNKNOWN_ERROR,
      500,
      false,
      { originalError: error.name, stack: error.stack }
    );
  }
  
  // API Response Error
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    
    // Check for common API error formats
    if ('status' in err || 'statusCode' in err) {
      const statusCode = err.status || err.statusCode;
      const message = err.message || err.error || 'API Error';
      const code = getErrorCodeFromStatus(statusCode);
      
      return new AppError(message, code, statusCode, true, err);
    }
    
    // Check for custom error format
    if ('code' in err && 'message' in err) {
      return new AppError(
        err.message,
        err.code,
        err.statusCode || 500,
        true,
        err.details
      );
    }
  }
  
  // String error
  if (typeof error === 'string') {
    return new AppError(error, ErrorCodes.UNKNOWN_ERROR, 500, false);
  }
  
  // Unknown error type
  return new AppError(
    'An unexpected error occurred',
    ErrorCodes.UNKNOWN_ERROR,
    500,
    false,
    { originalError: error }
  );
}

/**
 * Get error code from HTTP status
 */
function getErrorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCodes.BAD_REQUEST;
    case 401:
      return ErrorCodes.UNAUTHORIZED;
    case 403:
      return ErrorCodes.FORBIDDEN;
    case 404:
      return ErrorCodes.NOT_FOUND;
    case 409:
      return ErrorCodes.CONFLICT;
    case 429:
      return ErrorCodes.RATE_LIMIT_EXCEEDED;
    case 500:
      return ErrorCodes.INTERNAL_SERVER_ERROR;
    case 503:
      return ErrorCodes.SERVICE_UNAVAILABLE;
    default:
      if (status >= 400 && status < 500) {
        return ErrorCodes.BAD_REQUEST;
      }
      if (status >= 500) {
        return ErrorCodes.INTERNAL_SERVER_ERROR;
      }
      return ErrorCodes.UNKNOWN_ERROR;
  }
}

/**
 * Check if error is operational (expected) vs programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Format error for user display
 */
export function getUserFriendlyMessage(error: unknown): string {
  const appError = normalizeError(error);
  
  // Map error codes to user-friendly messages
  const userMessages: Record<ErrorCode, string> = {
    [ErrorCodes.UNAUTHORIZED]: 'Please log in to continue',
    [ErrorCodes.FORBIDDEN]: 'You don\'t have permission to perform this action',
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
    [ErrorCodes.BAD_REQUEST]: 'Invalid request. Please try again',
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please slow down',
    [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred',
  };
  
  return userMessages[appError.code as ErrorCode] || appError.message;
}

/**
 * Log error with appropriate severity
 */
export function logError(error: unknown, context?: Record<string, any>): void {
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
  
  // Log based on severity
  if (appError.isOperational) {
    console.warn('Operational Error:', logData);
  } else {
    console.error('Programming Error:', logData);
  }
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry or other error tracking service
    import('@/shared/lib/monitoring/sentry').then(({ captureException }) => {
      captureException(appError, { extra: logData });
    });
  }
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

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
export async function tryCatch<T>(
  fn: () => Promise<T> | T
): Promise<Result<T>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(normalizeError(error));
  }
}