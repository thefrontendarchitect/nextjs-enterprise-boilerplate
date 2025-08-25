import type { ApiError } from '../client';

export class ApiException extends Error {
  constructor(
    public readonly error: ApiError,
    public readonly statusCode?: number,
  ) {
    super(error.message);
    this.name = 'ApiException';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return error.error.message;
  }
  
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export function getErrorCode(error: unknown): string {
  if (error instanceof ApiException) {
    return error.error.code;
  }
  
  if (isApiError(error)) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
}