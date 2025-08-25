'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { Toaster } from '@/shared/components/ui/toaster';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { AuthProvider } from '@/modules/auth/context/auth-context';
import { I18nProvider } from '@/shared/lib/i18n/client';
import { AnnouncerProvider } from '@/shared/lib/accessibility/announcer';
import type { Locale } from '@/shared/lib/i18n/config';

interface ProvidersProps {
  children: ReactNode;
  locale: Locale;
  messages: Record<string, any>;
}

export default function Providers({ children, locale, messages }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
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
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
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
    <I18nProvider initialLocale={locale} initialMessages={messages}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <AnnouncerProvider>
              {children}
              <Toaster />
              <ReactQueryDevtools initialIsOpen={false} />
            </AnnouncerProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}