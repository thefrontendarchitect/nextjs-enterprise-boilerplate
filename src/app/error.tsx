'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { captureException } from '@/shared/lib/monitoring/sentry';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
    captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong!</CardTitle>
          </div>
          <CardDescription>
            An unexpected error occurred. We apologize for the inconvenience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="font-mono text-sm">
                {error.message || 'An unexpected error occurred'}
              </p>
              {error.digest && (
                <p className="text-xs mt-2 opacity-70">
                  Error ID: {error.digest}
                </p>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            If this problem persists, please contact support with the error ID above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}