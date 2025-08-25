'use client';

import { useState, useCallback, useRef } from 'react';
import { useErrorHandler } from './use-error-handler';
import type { ApiResult } from '@/shared/lib/api/client';
import { type Result } from '@/shared/lib/api/errors';

interface UseApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  showErrorToast?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface ApiCallState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Hook for making API calls with loading, error, and success states
 */
export function useApiCall<T = unknown, TArgs extends unknown[] = unknown[]>(
  apiFunction: (...args: TArgs) => Promise<ApiResult<T> | T>,
  options: UseApiCallOptions<T> = {}
) {
  const { onSuccess, onError, showErrorToast = true, retryCount = 0, retryDelay = 1000 } = options;

  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const { handleError } = useErrorHandler({ showToast: showErrorToast });
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(
    async (...args: TArgs) => {
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState({
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      let attempts = 0;
      const maxAttempts = retryCount + 1;

      const attemptCall = async (): Promise<void> => {
        attempts++;

        try {
          const result = await apiFunction(...args);

          // Handle ApiResult pattern
          if (result && typeof result === 'object' && 'success' in result) {
            const apiResult = result as ApiResult<T>;

            if (apiResult.success) {
              setState({
                data: apiResult.data,
                error: null,
                isLoading: false,
                isSuccess: true,
                isError: false,
              });

              if (onSuccess) {
                onSuccess(apiResult.data);
              }

              return;
            } else {
              throw apiResult.error;
            }
          }

          // Handle direct data response
          setState({
            data: result as T,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });

          if (onSuccess) {
            onSuccess(result as T);
          }
        } catch (error: unknown) {
          // Check if request was aborted
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }

          // Retry logic
          if (attempts < maxAttempts) {
            retryTimeoutRef.current = setTimeout(() => {
              attemptCall();
            }, retryDelay * attempts);
            return;
          }

          // Final error handling
          const appError = handleError(error);

          setState({
            data: null,
            error: appError,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });

          if (onError) {
            onError(appError);
          }
        }
      };

      await attemptCall();
    },
    [apiFunction, handleError, onSuccess, onError, retryCount, retryDelay]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    reset();
  }, [reset]);

  return {
    ...state,
    execute,
    reset,
    cancel,
  };
}

/**
 * Hook for making API calls with Result pattern
 */
export function useApiResult<T = unknown, E = Error, TArgs extends unknown[] = unknown[]>(
  apiFunction: (...args: TArgs) => Promise<Result<T, E>>,
  options: UseApiCallOptions<T> = {}
) {
  const [result, setResult] = useState<Result<T, E> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { handleError } = useErrorHandler({ showToast: options.showErrorToast });

  const execute = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      setResult(null);

      try {
        const res = await apiFunction(...args);
        setResult(res);

        if (res.success && options.onSuccess) {
          options.onSuccess(res.data);
        } else if (!res.success && options.onError) {
          options.onError(res.error);
          handleError(res.error);
        }

        return res;
      } catch (error) {
        const errorResult = { success: false as const, error: error as E };
        setResult(errorResult);
        handleError(error);

        if (options.onError) {
          options.onError(error);
        }

        return errorResult;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, options, handleError]
  );

  return {
    result,
    isLoading,
    isSuccess: result?.success === true,
    isError: result?.success === false,
    data: result?.success ? result.data : null,
    error: result && !result.success ? result.error : null,
    execute,
    reset: () => setResult(null),
  };
}
