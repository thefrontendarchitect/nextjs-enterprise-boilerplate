'use client';

import { useCallback, useRef } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import {
  normalizeError,
  getUserFriendlyMessage,
  logError,
  ErrorCodes,
  type AppError,
} from '@/shared/lib/api/errors';
import { useRouter } from 'next/navigation';

interface UseErrorHandlerOptions {
  fallbackMessage?: string;
  showToast?: boolean;
  logToConsole?: boolean;
  redirectOn401?: boolean;
  onError?: (error: AppError) => void;
}

/**
 * Hook for centralized error handling
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    fallbackMessage = 'An unexpected error occurred',
    showToast = true,
    logToConsole = true,
    redirectOn401 = true,
    onError,
  } = options;

  const { toast } = useToast();
  const router = useRouter();
  const handledErrors = useRef(new Set<string>());

  const handleError = useCallback(
    (error: unknown, context?: Record<string, unknown>) => {
      const appError = normalizeError(error);

      // Prevent duplicate error handling
      const errorKey = `${appError.code}-${appError.message}-${Date.now()}`;
      if (handledErrors.current.has(errorKey)) {
        return appError;
      }
      handledErrors.current.add(errorKey);

      // Clean up old error keys after 5 seconds
      setTimeout(() => handledErrors.current.delete(errorKey), 5000);

      // Log error
      if (logToConsole) {
        logError(appError, context);
      }

      // Handle specific error codes
      switch (appError.code) {
        case ErrorCodes.UNAUTHORIZED:
        case ErrorCodes.TOKEN_EXPIRED:
          if (redirectOn401) {
            router.push('/login?reason=session_expired');
          }
          break;

        case ErrorCodes.FORBIDDEN:
          if (showToast) {
            toast({
              title: 'Access Denied',
              description: "You don't have permission to perform this action",
              variant: 'destructive',
            });
          }
          break;

        case ErrorCodes.NETWORK_ERROR:
        case ErrorCodes.TIMEOUT:
          if (showToast) {
            toast({
              title: 'Connection Error',
              description: 'Please check your internet connection and try again',
              variant: 'destructive',
            });
          }
          break;

        case ErrorCodes.RATE_LIMIT_EXCEEDED:
          if (showToast) {
            toast({
              title: 'Too Many Requests',
              description: 'Please slow down and try again in a moment',
              variant: 'destructive',
            });
          }
          break;

        case ErrorCodes.SERVICE_UNAVAILABLE:
        case ErrorCodes.SERVER_ERROR:
        case ErrorCodes.INTERNAL_SERVER_ERROR:
          if (showToast) {
            toast({
              title: 'Server Error',
              description: 'Something went wrong. Please try again later.',
              variant: 'destructive',
            });
          }
          break;

        default:
          if (showToast) {
            const message = getUserFriendlyMessage(appError) || fallbackMessage;
            toast({
              title: 'Error',
              description: message,
              variant: 'destructive',
            });
          }
      }

      // Call custom error handler
      if (onError) {
        onError(appError);
      }

      return appError;
    },
    [toast, router, fallbackMessage, showToast, logToConsole, redirectOn401, onError]
  );

  // Return error handler and utilities
  return {
    handleError,
    clearHandledErrors: () => handledErrors.current.clear(),
  };
}

/**
 * Hook to throw errors to the nearest error boundary
 */
export function useAsyncError() {
  const handleError = useErrorHandler();

  return useCallback(
    (error: unknown) => {
      const appError = handleError.handleError(error);

      // Throw error to be caught by error boundary
      throw appError;
    },
    [handleError]
  );
}
