import * as Sentry from '@sentry/nextjs';

export function captureException(error: Error | unknown, context?: Record<string, any>) {
  console.error('Error captured:', error);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export { captureException as captureError };

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[${level.toUpperCase()}]`, message);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  }
}

export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    timestamp: Date.now(),
  });
}

// Transaction support removed in newer Sentry versions
// Use performance monitoring through automatic instrumentation