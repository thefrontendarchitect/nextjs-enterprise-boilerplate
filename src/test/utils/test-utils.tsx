import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/shared/components/theme-provider';
// Auth is now handled by Zustand stores - no provider needed
import { I18nProvider } from '@/shared/lib/i18n/client';
import { AnnouncerProvider } from '@/shared/lib/accessibility/announcer';
import type { Locale } from '@/shared/lib/i18n/config';

/**
 * Custom render function that includes all necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: Locale;
  messages?: Record<string, string | Record<string, string>>;
  queryClient?: QueryClient;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function AllTheProviders({
  children,
  locale = 'en',
  messages = {},
  queryClient = createTestQueryClient(),
}: {
  children: ReactNode;
  locale?: Locale;
  messages?: Record<string, string | Record<string, string>>;
  queryClient?: QueryClient;
}) {
  return (
    <I18nProvider initialLocale={locale} initialMessages={messages}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AnnouncerProvider>{children}</AnnouncerProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}

export function customRender(
  ui: ReactElement,
  { locale = 'en', messages = {}, queryClient, ...renderOptions }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders locale={locale} messages={messages} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Create mock API responses for testing
 */
export function createMockApiResponse<T>(
  data: T,
  options?: {
    status?: number;
    headers?: Record<string, string>;
    delay?: number;
  }
) {
  const response = new Response(JSON.stringify(data), {
    status: options?.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (options?.delay) {
    return new Promise<Response>((resolve) => {
      setTimeout(() => resolve(response), options.delay);
    });
  }

  return Promise.resolve(response);
}

/**
 * Create mock error responses for testing
 */
export function createMockErrorResponse(message: string, status: number = 500, code?: string) {
  return new Response(
    JSON.stringify({
      error: message,
      code: code || status.toString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Wait for async updates with better error messages
 */
export async function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage implements Storage {
  private store: Record<string, string> = {};

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

/**
 * Setup mock localStorage
 */
export function setupMockLocalStorage() {
  const mockStorage = new MockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
}

/**
 * Create mock user for testing
 */
import type { User } from '@/shared/types/auth';

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...overrides,
  };
}

/**
 * Create mock auth tokens for testing
 */
export function createMockTokens() {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Export custom render as default
export { customRender as render };
