'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { Toaster } from '@/shared/components/ui/toaster';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { I18nProvider } from '@/shared/lib/i18n/client';
import { AnnouncerProvider } from '@/shared/lib/accessibility/announcer';
import { AuthInitializer } from '@/modules/auth';
import type { Locale } from '@/shared/lib/i18n/config';
import { GlobalErrorBoundary } from './global-error-boundary';

interface ProvidersProps {
  children: ReactNode;
  locale: Locale;
  messages: Record<string, string | Record<string, string>>;
}

interface ApiError {
  status?: number;
  message?: string;
}

export default function Providers({ children, locale, messages }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors
              const apiError = error as ApiError;
              if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
                return false;
              }
              // Retry up to 2 times for other errors
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: 'always',
          },
          mutations: {
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors
              const apiError = error as ApiError;
              if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
                return false;
              }
              // Retry once for other errors
              return failureCount < 1;
            },
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nProvider initialLocale={locale} initialMessages={messages}>
          <ThemeProvider>
            <AuthInitializer>
              <AnnouncerProvider>
                {children}
                <Toaster />
                <ReactQueryDevtools initialIsOpen={false} />
              </AnnouncerProvider>
            </AuthInitializer>
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}
