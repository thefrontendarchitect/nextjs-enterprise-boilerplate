'use client';

import { useEffect } from 'react';
import { captureException } from '@/shared/lib/monitoring/sentry';
import { logError } from '@/shared/lib/api/errors';

/**
 * Global error handler for Next.js
 * This component handles errors that occur at the root level of the application.
 * It must be a client component and only works in production.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    logError(error, {
      context: 'global-error',
      digest: error.digest,
    });

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      captureException(error, {
        tags: {
          errorBoundary: 'global',
          digest: error.digest,
        },
      });
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">500</h1>
              <h2 className="text-xl font-semibold text-muted-foreground">Something went wrong!</h2>
              <p className="text-sm text-muted-foreground">
                We apologize for the inconvenience. Our team has been notified.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Error details (development only)
                </summary>
                <div className="mt-2 rounded-md bg-muted p-3">
                  <p className="break-all font-mono text-xs text-destructive">{error.message}</p>
                  {error.digest && (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              </details>
            )}

            <div className="flex justify-center gap-3">
              <button
                onClick={reset}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Try again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="rounded-md border border-border px-4 py-2 transition-colors hover:bg-accent"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
