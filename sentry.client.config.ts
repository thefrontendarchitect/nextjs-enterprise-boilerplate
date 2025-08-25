import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  environment: process.env.NODE_ENV,
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Filtering
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Facebook related
    'fb_xd_fragment',
    // Network errors
    'Network request failed',
    'NetworkError',
    'Failed to fetch',
  ],
  
  beforeSend(event, hint) {
    // Filter out non-app errors
    if (event.exception) {
      const error = hint.originalException;
      // Filter browser extension errors
      if (error && error.toString && error.toString().includes('extension://')) {
        return null;
      }
    }
    return event;
  },
});