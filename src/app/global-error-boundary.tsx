'use client';

import { ErrorBoundary } from '@/shared/components/error-boundary';
import { useEffect } from 'react';
import { captureException } from '@/shared/lib/monitoring/sentry';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { logError, getErrorMessage } from '@/shared/lib/api/errors';

interface GlobalErrorFallbackProps {
  error: Error;
  reset: () => void;
}

const GlobalErrorFallback = ({ error, reset }: GlobalErrorFallbackProps) => {
  useEffect(() => {
    // Log to error tracking service
    logError(error, { context: 'Global error boundary' });
    if (process.env.NODE_ENV === 'production') {
      captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Something went wrong</AlertTitle>
          <AlertDescription className="mt-3 space-y-3">
            <p className="text-sm">
              An unexpected error occurred. We&apos;ve been notified and are working to fix it.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium">
                  Error details (development only)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-background p-2 text-xs">
                  {getErrorMessage(error)}
                  {error.stack && '\n\n' + error.stack}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={reset} variant="default" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <GlobalErrorFallback
          error={new Error('An error occurred')}
          reset={() => window.location.reload()}
        />
      }
      onError={(error, errorInfo) => {
        // Additional global error handling
        logError(error, { context: 'Global error', errorInfo });

        // Send to monitoring in production
        if (process.env.NODE_ENV === 'production') {
          captureException(error, {
            extra: {
              componentStack: errorInfo.componentStack,
              errorBoundary: 'global',
            },
          });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Export a version that can handle async errors
export function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Loading failed. Please try again.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
