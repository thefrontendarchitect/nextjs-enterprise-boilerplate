# AI Code Generation Patterns Guide

> **IMPORTANT**: This is the definitive guide for AI code generation in this codebase. Follow these patterns EXACTLY to maintain consistency and prevent hallucinations.

## Table of Contents

1. [Project Context & Architecture](#project-context--architecture)
2. [File Organization & Naming](#file-organization--naming)
3. [TypeScript Patterns](#typescript-patterns)
4. [React Component Patterns](#react-component-patterns)
5. [State Management (Zustand)](#state-management-zustand)
6. [API Integration](#api-integration)
7. [Form Handling](#form-handling)
8. [Error Handling](#error-handling)
9. [Authentication & Security](#authentication--security)
10. [Testing Patterns](#testing-patterns)
11. [Styling Patterns](#styling-patterns)
12. [Internationalization](#internationalization)
13. [Performance Patterns](#performance-patterns)
14. [Common Anti-patterns](#common-anti-patterns)
15. [Code Templates](#code-templates)

## Quick Reference: Mock vs Real API

### To Use Mock APIs (Default for Development)

```bash
# In .env.local
NEXT_PUBLIC_USE_MOCK_API=true
```

### To Use Real APIs

```bash
# In .env.local
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://your-api.com

# Then restart dev server
pnpm dev
```

### Check Current Mode

```typescript
import { env } from '@/config/env';
console.log('Using mock API:', env.NEXT_PUBLIC_USE_MOCK_API);
console.log('API URL:', env.NEXT_PUBLIC_API_URL);
```

---

## Project Context & Architecture

### Vertical Slice Architecture (VSA)

This codebase uses **Vertical Slice Architecture**. Each feature is self-contained in `/src/modules/[feature]/`.

**✅ DO:**

```typescript
// Each module is self-contained
/src/modules/auth/
  ├── api/           // API calls and types
  ├── components/    // Feature-specific components
  ├── hooks/         // Feature-specific hooks
  ├── stores/        // Feature-specific state
  └── index.ts       // Public exports ONLY
```

**❌ DON'T:**

```typescript
// Don't organize by technical layers
/src/
  ├── components/    // All components mixed
  ├── hooks/         // All hooks mixed
  ├── api/           // All API calls mixed
```

### Module Boundaries

**STRICT RULE**: Modules can ONLY import from:

1. Their own module files
2. `/src/shared/` (shared resources)
3. External packages

**✅ DO:**

```typescript
// In /src/modules/auth/components/login-form.tsx
import { useAuth } from '../hooks/use-auth'; // Same module
import { Button } from '@/shared/components/ui/button'; // Shared
import { z } from 'zod'; // External
```

**❌ DON'T:**

```typescript
// In /src/modules/auth/components/login-form.tsx
import { useProduct } from '@/modules/product/hooks/use-product'; // Cross-module import!
```

---

## File Organization & Naming

### File Naming Conventions

**STRICT RULES:**

1. **Components**: `kebab-case.tsx` → exports `PascalCase`
2. **Hooks**: `use-kebab-case.ts` → exports `useCamelCase`
3. **Utilities**: `kebab-case.ts` → exports `camelCase`
4. **Types**: `types.ts` or `schemas.ts`
5. **Tests**: `[name].test.tsx` or `[name].test.ts`
6. **API**: `[feature].api.ts`, `[feature].api.mock.ts`

**✅ DO:**

```typescript
// File: login-form.tsx
export function LoginForm() {}

// File: use-auth.ts
export function useAuth() {}

// File: auth.api.ts
export const authApi = {};
```

### Import Order

**ALWAYS** organize imports in this order:

```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External library imports
import { z } from 'zod';
import { useForm } from 'react-hook-form';

// 3. Shared imports (use @/ alias)
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils/cn';

// 4. Module imports (use relative paths)
import { useAuth } from '../hooks/use-auth';
import type { LoginRequest } from '../api/types';
```

### Export Patterns

**✅ DO: Named exports for everything except pages**

```typescript
// Named exports
export const authApi = {};
export function LoginForm() {}
export interface User {}
export type AuthState = {};
```

**✅ DO: Default export ONLY for Next.js pages**

```typescript
// In app/(auth)/dashboard/page.tsx
export default function DashboardPage() {}
```

**✅ DO: Barrel exports via index.ts**

```typescript
// modules/auth/index.ts - ONLY export public API
export { authApi } from './api/auth.api';
export { LoginForm } from './components/login-form';
export { useAuth } from './hooks/use-auth';
export type { User } from './api/types';

// DON'T export internal implementations
// DON'T export mock handlers
// DON'T export schemas (unless needed externally)
```

---

## TypeScript Patterns

### Interface vs Type

**RULE**: Use `interface` for object shapes, `type` for unions/intersections/utilities

**✅ DO:**

```typescript
// Interface for object shapes
interface User {
  id: string;
  email: string;
  name: string;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

// Type for unions and computed types
type ApiResult<T> = { success: true; data: T } | { success: false; error: AppError };

type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

### Generic Patterns

**ALWAYS** use meaningful generic names and constraints:

**✅ DO:**

```typescript
// Clear generic names with constraints
function createMockWrapper<TData, TArgs extends unknown[]>(
  mockHandler: (...args: TArgs) => Promise<TData>,
  realHandler: (...args: TArgs) => Promise<ApiResult<TData>>
): (...args: TArgs) => Promise<ApiResult<TData>>;

// Generic with default
interface ApiResponse<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
}
```

### Const Assertions for Enums

**NEVER** use TypeScript enums. Use const objects with const assertion:

**✅ DO:**

```typescript
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

**❌ DON'T:**

```typescript
enum ErrorCodes {
  // Don't use enum
  UNAUTHORIZED = 'UNAUTHORIZED',
}
```

### Zod Schema Patterns

**ALWAYS** colocate Zod schemas with their types:

**✅ DO:**

```typescript
// In api/schemas.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
});

// In api/types.ts
import type { z } from 'zod';
import { userSchema } from './schemas';

export type User = z.infer<typeof userSchema>;
```

---

## React Component Patterns

### Component Structure Template

**ALWAYS** follow this exact structure:

```typescript
'use client';  // Only if needed

import * as React from 'react';
// Other imports...

// Types/Interfaces
interface ComponentNameProps {
  children?: React.ReactNode;
  className?: string;
  // Other props...
}

// Component definition with forwardRef if needed
export const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ children, className, ...props }, ref) => {
    // Hooks first
    const [state, setState] = React.useState();

    // Computed values
    const computedValue = React.useMemo(() => {
      // Computation
    }, [dependencies]);

    // Handlers
    const handleClick = React.useCallback(() => {
      // Handler logic
    }, [dependencies]);

    // Effects last
    React.useEffect(() => {
      // Effect logic
    }, [dependencies]);

    // Return JSX
    return (
      <div ref={ref} className={cn('base-classes', className)} {...props}>
        {children}
      </div>
    );
  }
);

ComponentName.displayName = 'ComponentName';
```

### Custom Hook Pattern

**ALWAYS** structure custom hooks like this:

```typescript
// File: use-feature-name.ts
import { useState, useCallback, useMemo } from 'react';

export function useFeatureName(options?: FeatureOptions) {
  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Data | null>(null);

  // Actions
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Async logic
    } finally {
      setLoading(false);
    }
  }, [dependencies]);

  // Computed values
  const isReady = useMemo(() => {
    return !loading && data !== null;
  }, [loading, data]);

  // Return consistent object
  return {
    // State
    data,
    loading,
    isReady,
    // Actions
    fetchData,
  };
}
```

### Component Variants with CVA

**ALWAYS** use CVA for component variants:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva(
  'base-classes-here',
  {
    variants: {
      variant: {
        default: 'variant-classes',
        secondary: 'variant-classes',
      },
      size: {
        sm: 'size-classes',
        md: 'size-classes',
        lg: 'size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  // Additional props
}

export const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
```

---

## State Management (Zustand)

### Store Creation Pattern

**ALWAYS** create stores following this pattern:

```typescript
// File: stores/feature-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface FeatureState {
  // State
  data: Data | null;
  isLoading: boolean;
  error: Error | null;

  // Actions (always prefix with set/update/clear etc.)
  setData: (data: Data) => void;
  updateData: (partial: Partial<Data>) => void;
  clearData: () => void;

  // Async actions
  fetchData: () => Promise<void>;

  // Computed getters (if needed)
  isReady: () => boolean;
}

export const useFeatureStore = create<FeatureState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        data: null,
        isLoading: false,
        error: null,

        // Actions implementation
        setData: (data) => set({ data }, false, 'setData'),

        updateData: (partial) =>
          set((state) => ({ data: { ...state.data, ...partial } }), false, 'updateData'),

        clearData: () => set({ data: null }, false, 'clearData'),

        // Async action
        fetchData: async () => {
          set({ isLoading: true, error: null }, false, 'fetchData_start');
          try {
            const result = await api.getData();
            if (result.success) {
              set({ data: result.data, isLoading: false }, false, 'fetchData_success');
            } else {
              set({ error: result.error, isLoading: false }, false, 'fetchData_error');
            }
          } catch (error) {
            set({ error: error as Error, isLoading: false }, false, 'fetchData_error');
          }
        },

        // Computed
        isReady: () => {
          const state = get();
          return !state.isLoading && state.data !== null;
        },
      }),
      {
        name: 'feature-storage', // Unique name
        partialize: (state) => ({
          // Only persist what's needed
          data: state.data,
        }),
      }
    ),
    { name: 'feature-store' } // DevTools name
  )
);

// Selector hooks to prevent re-renders
export const useFeatureData = () => useFeatureStore((state) => state.data);
export const useFeatureLoading = () => useFeatureStore((state) => state.isLoading);

// Memoized actions hook
export const useFeatureActions = () => {
  const setData = useFeatureStore((state) => state.setData);
  const fetchData = useFeatureStore((state) => state.fetchData);

  return React.useMemo(() => ({ setData, fetchData }), [setData, fetchData]);
};
```

### Cleanup Registry Pattern

**USE** for managing subscriptions and intervals:

```typescript
class CleanupRegistry {
  private cleanupFns = new Set<() => void>();

  register(fn: () => void) {
    this.cleanupFns.add(fn);
    return () => this.unregister(fn);
  }

  unregister(fn: () => void) {
    this.cleanupFns.delete(fn);
  }

  cleanup() {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.clear();
  }
}

export const featureCleanupRegistry = new CleanupRegistry();
```

---

## API Integration

### API Endpoint Pattern

**ALWAYS** structure API files like this:

```typescript
// File: api/feature.api.ts
import { apiClient } from '@/shared/lib/api/config';
import { handleApiResponse } from '@/shared/lib/api/client';
import { validateResponse } from '@/shared/lib/api/validators';
import { createMockWrapper, mockDelays } from '@/shared/lib/api/mock-wrapper';
import { featureMockHandlers } from './feature.api.mock';
import type { FeatureRequest, FeatureResponse } from './types';
import { featureResponseSchema } from './schemas';

export const featureApi = {
  // GET request
  getData: createMockWrapper(
    featureMockHandlers.getData,
    async (id: string) =>
      handleApiResponse(async () => {
        const response = await apiClient.get(`features/${id}`);
        return validateResponse(response, featureResponseSchema, 'feature data');
      }),
    { delay: mockDelays.standard }
  ),

  // POST request
  createData: createMockWrapper(
    featureMockHandlers.createData,
    async (data: FeatureRequest) =>
      handleApiResponse(async () => {
        const response = await apiClient.post('features', { json: data });
        return validateResponse(response, featureResponseSchema, 'create feature');
      }),
    { delay: mockDelays.standard }
  ),

  // PUT request
  updateData: createMockWrapper(
    featureMockHandlers.updateData,
    async (id: string, data: Partial<FeatureRequest>) =>
      handleApiResponse(async () => {
        const response = await apiClient.put(`features/${id}`, { json: data });
        return validateResponse(response, featureResponseSchema, 'update feature');
      }),
    { delay: mockDelays.standard }
  ),

  // DELETE request
  deleteData: createVoidMockWrapper(
    featureMockHandlers.deleteData,
    async (id: string) => handleApiResponse(() => apiClient.delete(`features/${id}`)),
    { delay: mockDelays.fast }
  ),
};
```

### Mock Handler Pattern

**ALWAYS** create mock handlers:

```typescript
// File: api/feature.api.mock.ts
import type { FeatureRequest, FeatureResponse } from './types';

const createMockFeature = (data?: Partial<FeatureResponse>): FeatureResponse => ({
  id: 'mock-id-' + Math.random().toString(36).substring(7),
  name: 'Mock Feature',
  createdAt: new Date().toISOString(),
  ...data,
});

export const featureMockHandlers = {
  getData: async (id: string): Promise<FeatureResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return createMockFeature({ id });
  },

  createData: async (data: FeatureRequest): Promise<FeatureResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return createMockFeature(data);
  },

  updateData: async (id: string, data: Partial<FeatureRequest>): Promise<FeatureResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return createMockFeature({ id, ...data });
  },

  deleteData: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },
};
```

### Using API Results

**ALWAYS** handle results with pattern matching:

```typescript
const handleSubmit = async (data: FormData) => {
  const result = await featureApi.createData(data);

  if (result.success) {
    // TypeScript knows result.data exists
    console.log('Created:', result.data);
    toast.success('Feature created successfully');
    router.push(`/features/${result.data.id}`);
  } else {
    // TypeScript knows result.error exists
    console.error('Error:', result.error);
    toast.error(getUserFriendlyMessage(result.error));
  }
};
```

### Switching Between Mock and Real APIs

The codebase uses a **dual-mode API system** that can switch between mock and real APIs without changing any component code.

#### How It Works

1. **Environment Variable Control**

   ```bash
   # .env.local or .env
   NEXT_PUBLIC_USE_MOCK_API=true   # Use mock APIs
   NEXT_PUBLIC_USE_MOCK_API=false  # Use real APIs
   NEXT_PUBLIC_API_URL=https://api.yourapp.com  # Real API URL
   ```

2. **Automatic Switching via Mock Wrapper**
   The `createMockWrapper` function automatically chooses based on the environment:
   ```typescript
   // In api/feature.api.ts
   export const featureApi = {
     getData: createMockWrapper(
       mockHandlers.getData, // Mock implementation
       async (id: string) => {
         // Real API implementation
         // This runs when NEXT_PUBLIC_USE_MOCK_API=false
         return handleApiResponse(async () => {
           const response = await apiClient.get(`features/${id}`);
           return validateResponse(response, featureResponseSchema);
         });
       },
       { delay: mockDelays.standard }
     ),
   };
   ```

#### Switching to Real APIs

**Method 1: Global Switch (Recommended)**

```bash
# Set in .env.local
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.yourapp.com

# Restart the dev server
pnpm dev
```

**Method 2: Runtime Override for Specific Endpoints**

```typescript
// Create a custom API client that always uses real API
import { apiClient } from '@/shared/lib/api/config';
import { handleApiResponse } from '@/shared/lib/api/client';

// Direct API call bypassing mock wrapper
export const realOnlyApi = {
  getData: async (id: string) => {
    return handleApiResponse(async () => {
      const response = await apiClient.get(`features/${id}`);
      return response;
    });
  },
};
```

**Method 3: Conditional Mock Usage**

```typescript
// Override mock setting for specific features
export const hybridApi = {
  // Always use mock for this endpoint (e.g., not ready yet)
  getDraft: createMockWrapper(
    mockHandlers.getDraft,
    realHandler,
    { enabled: true } // Force mock even if global is false
  ),

  // Always use real for this endpoint
  getProduction: createMockWrapper(
    mockHandlers.getProduction,
    realHandler,
    { enabled: false } // Force real even if global is true
  ),
};
```

#### API Configuration

The real API client is configured in `/src/shared/lib/api/config.ts`:

```typescript
import { createApi } from './client';
import { env } from '@/config/env';
import { useAuthStore } from '@/modules/auth/stores/unified-auth-store';

export const apiClient = createApi({
  baseUrl: env.NEXT_PUBLIC_API_URL, // From environment variable
  getAccessToken: () => useAuthStore.getState().getAccessToken(),
  refreshAccessToken: () => useAuthStore.getState().refreshAccessToken(),
  onUnauthorized: async () => {
    await useAuthStore.getState().logout();
    window.location.href = '/login';
  },
});
```

#### Development Workflow

**During Development:**

1. Start with mocks to develop UI independently
2. Implement mock handlers that match API contracts
3. Switch to real API when backend is ready
4. Keep mocks for testing and offline development

```bash
# Development with mocks
NEXT_PUBLIC_USE_MOCK_API=true pnpm dev

# Development with real API
NEXT_PUBLIC_USE_MOCK_API=false pnpm dev

# Production always uses real API
pnpm build  # Mock code is tree-shaken in production
```

#### Testing with Different Modes

```typescript
// In tests, you can override the mock setting
import { vi } from 'vitest';

// Force mock mode in tests
vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');

// Or mock specific endpoints
vi.mock('@/modules/auth/api/auth.api', () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({
      success: true,
      data: { user: mockUser, token: 'test-token' },
    }),
  },
}));
```

#### Common Scenarios

**Scenario 1: Backend not ready**

```typescript
// Keep using mocks
NEXT_PUBLIC_USE_MOCK_API = true;
```

**Scenario 2: Backend ready for some endpoints**

```typescript
// Use real API globally but override specific endpoints
export const api = {
  // Ready endpoint - uses real based on env
  getUsers: createMockWrapper(mock, real),

  // Not ready - always mock
  getAnalytics: createMockWrapper(mock, real, { enabled: true }),
};
```

**Scenario 3: Production deployment**

```typescript
// In production, mocks are tree-shaken out
// Only real API code is bundled
NEXT_PUBLIC_USE_MOCK_API=false  // or omit entirely
NEXT_PUBLIC_API_URL=https://api.production.com
```

**Scenario 4: Offline development**

```typescript
// Use mocks when developing offline
NEXT_PUBLIC_USE_MOCK_API = true;
```

#### Important Notes

1. **Mock handlers must match real API contracts** - Same request/response types
2. **Mocks are removed in production builds** - No bundle bloat
3. **Same code for both modes** - Components don't know if using mock or real
4. **Gradual migration** - Switch endpoints individually as backend becomes ready
5. **Type safety maintained** - TypeScript ensures consistency between mock and real

---

## Form Handling

### Form Component Pattern

**ALWAYS** use React Hook Form + Zod:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

// 1. Define schema
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof formSchema>;

// 2. Create form component
export function FeatureForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const result = await api.submitData(data);
    if (result.success) {
      // Handle success
    } else {
      // Handle error
      form.setError('root', {
        message: getUserFriendlyMessage(result.error),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Error Handling

### Error Creation Pattern

**ALWAYS** use AppError class:

```typescript
import { AppError, ErrorCodes } from '@/shared/lib/api/errors';

// Creating errors
throw new AppError(
  'User not found',
  ErrorCodes.NOT_FOUND,
  404,
  true, // isOperational
  { userId: id }, // details
  requestId, // optional request ID
  false // retryable
);

// Normalizing unknown errors
import { normalizeError } from '@/shared/lib/api/errors';

try {
  // Some operation
} catch (error) {
  const appError = normalizeError(error);
  logError(appError, { context: 'operation_name' });
}
```

### Error Display Pattern

**ALWAYS** show user-friendly messages:

```typescript
import { getUserFriendlyMessage } from '@/shared/lib/api/errors';
import { toast } from '@/shared/hooks/use-toast';

// In component
if (result.error) {
  toast({
    variant: 'destructive',
    title: 'Error',
    description: getUserFriendlyMessage(result.error),
  });
}
```

---

## Authentication & Security

### Protected Route Pattern

**USE** layout components for protection:

```typescript
// app/(auth)/layout.tsx
import { redirect } from 'next/navigation';
import { useAuth } from '@/modules/auth';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    redirect('/login');
  }

  return <>{children}</>;
}
```

### Using Auth in Components

**ALWAYS** use the auth hooks:

```typescript
import { useAuth, useCurrentUser, useIsAuthenticated } from '@/modules/auth';

export function UserProfile() {
  const { logout } = useAuth();
  const user = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
```

---

## Testing Patterns

### Component Test Pattern

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { FeatureComponent } from './feature-component';
import { renderWithProviders } from '@/test/utils/test-utils';

describe('FeatureComponent', () => {
  it('should handle user interaction', async () => {
    // Arrange
    const mockHandler = vi.fn();
    const { user } = renderWithProviders(
      <FeatureComponent onSubmit={mockHandler} />
    );

    // Act
    const input = screen.getByLabelText('Email');
    await user.type(input, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });
});
```

### Mock API Test Pattern

```typescript
import { authApi } from '@/modules/auth';
import { vi } from 'vitest';

// Mock the entire module
vi.mock('@/modules/auth/api/auth.api', () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({
      success: true,
      data: { user: mockUser, accessToken: 'token' },
    }),
  },
}));
```

---

## Styling Patterns

### Using cn() Utility

**ALWAYS** use cn() for conditional classes:

```typescript
import { cn } from '@/shared/lib/utils/cn';

// ✅ DO: Use cn() for merging classes
<div className={cn(
  'base-classes px-4 py-2',  // Base classes
  isActive && 'bg-primary',  // Conditional classes
  isDisabled && 'opacity-50 cursor-not-allowed',
  className  // Allow override from props
)} />

// ❌ DON'T: Use template literals or string concatenation
<div className={`base-classes ${isActive ? 'bg-primary' : ''}`} />
```

### Theme-aware Styling

**USE** CSS variables for theme-aware colors:

```typescript
// ✅ DO: Use semantic color variables
<div className="bg-background text-foreground border-border" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-destructive text-destructive-foreground" />

// ❌ DON'T: Use explicit colors
<div className="bg-white text-black dark:bg-black dark:text-white" />
```

---

## Internationalization

### Client Component i18n

```typescript
'use client';

import { useI18n } from '@/shared/lib/i18n/client';

export function ClientComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.message', { name: 'User' })}</p>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}
```

### Server Component i18n

```typescript
import { getLocale, t } from '@/shared/lib/i18n/server';

export default async function ServerComponent() {
  const locale = await getLocale();
  const welcomeText = await t('welcome.title');

  return <h1>{welcomeText}</h1>;
}
```

---

## Performance Patterns

### When to Use Memoization

```typescript
// ✅ DO: Memoize expensive computations
const processedData = useMemo(() => {
  return heavyDataProcessing(rawData);
}, [rawData]);

// ✅ DO: Memoize callbacks passed to multiple children
const handleClick = useCallback(
  (id: string) => {
    doSomething(id);
  },
  [doSomething]
);

// ❌ DON'T: Memoize simple computations
const sum = useMemo(() => a + b, [a, b]); // Overhead not worth it
```

### Request Optimization

```typescript
// Request deduplication is automatic for GET requests
const result1 = await api.getData(id); // Makes request
const result2 = await api.getData(id); // Returns cached result if within 5s
```

---

## Common Anti-patterns

### ❌ DON'T: Mix module concerns

```typescript
// BAD: Auth module importing from product module
// In /src/modules/auth/components/login-form.tsx
import { ProductList } from '@/modules/product/components/product-list';
```

### ❌ DON'T: Use any type

```typescript
// BAD: Using any
const handleData = (data: any) => {};

// GOOD: Use unknown and validate
const handleData = (data: unknown) => {
  const validated = validateData(data);
};
```

### ❌ DON'T: Mutate state directly

```typescript
// BAD: Mutating state
const sorted = items.sort();

// GOOD: Create new array
const sorted = [...items].sort();
```

### ❌ DON'T: Use index as key in dynamic lists

```typescript
// BAD: Index as key
{items.map((item, index) => <Item key={index} />)}

// GOOD: Stable unique ID
{items.map((item) => <Item key={item.id} />)}
```

### ❌ DON'T: Import from dist or node_modules paths

```typescript
// BAD: Direct node_modules import
import something from '../../node_modules/package/dist/file';

// GOOD: Package import
import something from 'package';
```

### ❌ DON'T: Use default exports (except for pages)

```typescript
// BAD: Default export for components
export default function Button() {}

// GOOD: Named export
export function Button() {}
```

---

## Code Templates

### New Module Template

```typescript
// Structure for a new module
/src/modules/feature/
  ├── api/
  │   ├── feature.api.ts
  │   ├── feature.api.mock.ts
  │   ├── schemas.ts
  │   └── types.ts
  ├── components/
  │   └── feature-component.tsx
  ├── hooks/
  │   └── use-feature.ts
  ├── stores/
  │   └── feature-store.ts
  └── index.ts
```

### New Component Template

```typescript
'use client';  // Only if needed

import * as React from 'react';
import { cn } from '@/shared/lib/utils/cn';

interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    );
  }
);

Component.displayName = 'Component';
```

### New API Endpoint Template

```typescript
// api/feature.api.ts
export const featureApi = {
  action: createMockWrapper(
    mockHandlers.action,
    async (data: Request) =>
      handleApiResponse(async () => {
        const response = await apiClient.post('endpoint', { json: data });
        return validateResponse(response, responseSchema, 'action');
      }),
    { delay: mockDelays.standard }
  ),
};
```

### New Store Template

```typescript
interface StoreState {
  // State
  data: Data | null;

  // Actions
  setData: (data: Data) => void;
}

export const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      data: null,
      setData: (data) => set({ data }, false, 'setData'),
    }),
    { name: 'store-name' }
  )
);
```

---

## Critical Rules Summary

1. **NEVER** import across modules (only from same module or shared)
2. **ALWAYS** use ApiResult pattern for API calls
3. **ALWAYS** use named exports (except Next.js pages)
4. **ALWAYS** handle errors with AppError class
5. **ALWAYS** validate API responses with Zod
6. **ALWAYS** use cn() utility for className merging
7. **ALWAYS** use React Hook Form + Zod for forms
8. **NEVER** use TypeScript enums (use const objects)
9. **ALWAYS** follow VSA - features in modules, not layers
10. **ALWAYS** create mock handlers for API endpoints
11. **ALWAYS** use semantic theme variables (not colors)
12. **ALWAYS** memoize Zustand selectors to prevent re-renders
13. **NEVER** use any type - use unknown and validate
14. **ALWAYS** use forwardRef for reusable UI components
15. **ALWAYS** follow the exact file naming conventions

---

## Environment Variables

Always access via the validated env object:

```typescript
import { env } from '@/config/env';

// ✅ DO: Use type-safe env
if (env.NEXT_PUBLIC_USE_MOCK_API) {
}

// ❌ DON'T: Use process.env directly
if (process.env.NEXT_PUBLIC_USE_MOCK_API) {
}
```

---

## Final Notes

- This guide is **prescriptive** - follow it exactly
- When in doubt, check existing code for patterns
- Maintain consistency over personal preferences
- Each pattern exists for maintainability and scalability
- Ask for clarification rather than assuming

**Remember**: Consistency is more important than perfection. Follow these patterns exactly to maintain codebase integrity.

---

## Frontend Best Practices

### Component Design Principles

#### 1. Single Responsibility Principle

Each component should do ONE thing well.

**✅ DO:**

```typescript
// UserAvatar.tsx - Only handles avatar display
export function UserAvatar({ user }: { user: User }) {
  return <Avatar src={user.avatar} alt={user.name} />;
}

// UserInfo.tsx - Only handles user info display
export function UserInfo({ user }: { user: User }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

**❌ DON'T:**

```typescript
// Component doing too many things
export function UserCardWithEditingAndAPICallsAndValidation() {
  // Too many responsibilities!
}
```

#### 2. Composition Over Configuration

Build complex UI from simple, composable parts.

**✅ DO:**

```typescript
// Composable card components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**❌ DON'T:**

```typescript
// Over-configured single component
<SuperCard
  title="Title"
  description="Description"
  showFooter={true}
  footerButtons={[...]}
  contentType="default"
  // 20 more props...
/>
```

### State Management Best Practices

#### 1. State Colocation

Keep state as close to where it's used as possible.

**✅ DO:**

```typescript
// State only needed in this component
function SearchBar() {
  const [query, setQuery] = useState('');  // Local state

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

**❌ DON'T:**

```typescript
// Lifting state unnecessarily to global store
useGlobalStore.setState({ searchBarQuery: value }); // Overkill for local UI state
```

#### 2. Derived State Instead of Synced State

Calculate values instead of storing redundant state.

**✅ DO:**

```typescript
function Cart({ items }: { items: CartItem[] }) {
  // Derive total from items
  const total = useMemo(() =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return <div>Total: ${total}</div>;
}
```

**❌ DON'T:**

```typescript
function Cart({ items }: { items: CartItem[] }) {
  const [total, setTotal] = useState(0);

  // Syncing state - prone to bugs
  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [items]);
}
```

### Performance Best Practices

#### 1. Optimize Re-renders

Use React DevTools Profiler to identify unnecessary re-renders.

**✅ DO:**

```typescript
// Memoize expensive children
const ExpensiveChild = memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// Split state to minimize re-render scope
function Component() {
  const [search, setSearch] = useState('');  // Frequently changes
  const [data, setData] = useState([]);      // Rarely changes

  return (
    <>
      <SearchInput value={search} onChange={setSearch} />
      <ExpensiveChild data={data} />  {/* Won't re-render on search change */}
    </>
  );
}
```

#### 2. Lazy Load Heavy Components

Split code at route and component level.

**✅ DO:**

```typescript
import { lazy, Suspense } from 'react';

// Route-level splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Component-level splitting for heavy components
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HeavyChart />
    </Suspense>
  );
}
```

#### 3. Virtualize Long Lists

Use virtualization for lists with 100+ items.

**✅ DO:**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function LongList({ items }: { items: Item[] }) {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} style={{ transform: `translateY(${virtualItem.start}px)` }}>
            <Item item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Accessibility Best Practices

#### 1. Semantic HTML

Use proper HTML elements for their intended purpose.

**✅ DO:**

```typescript
<button onClick={handleClick}>Click me</button>
<nav><ul><li><a href="/home">Home</a></li></ul></nav>
<main><article><h1>Title</h1></article></main>
```

**❌ DON'T:**

```typescript
<div onClick={handleClick}>Click me</div>  // Not keyboard accessible
<div className="navigation">...</div>  // No semantic meaning
```

#### 2. ARIA Labels and Descriptions

Provide context for screen readers.

**✅ DO:**

```typescript
<button
  aria-label="Delete item"
  aria-describedby="delete-warning"
  onClick={handleDelete}
>
  <TrashIcon />
</button>
<span id="delete-warning" className="sr-only">
  This action cannot be undone
</span>

<input
  aria-label="Search products"
  aria-invalid={hasError}
  aria-describedby={hasError ? "search-error" : undefined}
/>
```

#### 3. Focus Management

Handle focus for dynamic content and modals.

**✅ DO:**

```typescript
function Modal({ isOpen, onClose, children }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus first interactive element
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogClose ref={closeButtonRef} />
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Data Fetching Best Practices

#### 1. Use TanStack Query for Server State

Never store server data in Zustand.

**✅ DO:**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll(),
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });
}

function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

**❌ DON'T:**

```typescript
// Don't store server data in Zustand
const useStore = create((set) => ({
  products: [], // This is server state!
  fetchProducts: async () => {
    const products = await api.getProducts();
    set({ products });
  },
}));
```

#### 2. Optimistic Updates

Provide instant feedback for better UX.

**✅ DO:**

```typescript
const mutation = useMutation({
  mutationFn: api.updateItem,
  onMutate: async (newData) => {
    // Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: ['items'] });

    // Snapshot previous value
    const previousItems = queryClient.getQueryData(['items']);

    // Optimistically update
    queryClient.setQueryData(['items'], (old) =>
      old.map((item) => (item.id === newData.id ? newData : item))
    );

    return { previousItems };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['items'], context.previousItems);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

### Form Best Practices

#### 1. Progressive Enhancement

Forms should work without JavaScript when possible.

**✅ DO:**

```typescript
<form action="/api/submit" method="POST" onSubmit={handleSubmit}>
  <input name="email" type="email" required />
  <button type="submit">Submit</button>
</form>
```

#### 2. Real-time Validation Feedback

Validate on blur, show errors after interaction.

**✅ DO:**

```typescript
const form = useForm({
  mode: 'onBlur',  // Validate on blur
  reValidateMode: 'onChange',  // Re-validate on change after error
});

// Field-level validation
<FormField
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormControl>
        <Input {...field} />
      </FormControl>
      {fieldState.isTouched && fieldState.error && (
        <FormMessage />
      )}
    </FormItem>
  )}
/>
```

#### 3. Disable Submit During Processing

Prevent double submissions.

**✅ DO:**

```typescript
<Button
  type="submit"
  disabled={form.formState.isSubmitting}
>
  {form.formState.isSubmitting ? (
    <>
      <Spinner className="mr-2" />
      Submitting...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

### Error Handling Best Practices

#### 1. User-Friendly Error Messages

Always translate technical errors to user language.

**✅ DO:**

```typescript
const errorMessages = {
  NETWORK_ERROR: "Can't connect to the server. Please check your internet connection.",
  UNAUTHORIZED: 'Please log in to continue.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
};

function handleError(error: AppError) {
  toast.error(errorMessages[error.code] || 'Something went wrong. Please try again.');
}
```

#### 2. Error Boundaries for Graceful Failures

Catch errors at strategic boundaries.

**✅ DO:**

```typescript
// Wrap feature sections
<ErrorBoundary fallback={<FeatureErrorFallback />}>
  <FeatureSection />
</ErrorBoundary>

// Different boundaries for different areas
<ErrorBoundary fallback={<SidebarErrorFallback />}>
  <Sidebar />
</ErrorBoundary>
```

#### 3. Retry Mechanisms

Allow users to recover from transient errors.

**✅ DO:**

```typescript
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Alert>
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{getUserFriendlyMessage(error)}</AlertDescription>
      <Button onClick={resetErrorBoundary} className="mt-4">
        Try again
      </Button>
    </Alert>
  );
}
```

### Security Best Practices

#### 1. Never Trust Client Input

Always validate on the server.

**✅ DO:**

```typescript
// Client-side validation for UX
const schema = z.object({
  amount: z.number().min(0).max(1000),
});

// Server MUST also validate
const result = await api.process(data); // Server validates again
```

#### 2. Sanitize User Content

Prevent XSS attacks.

**✅ DO:**

```typescript
import DOMPurify from 'isomorphic-dompurify';

function UserContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

**❌ DON'T:**

```typescript
// Never render unsanitized HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

#### 3. Secure Sensitive Operations

Use CSRF tokens and confirm destructive actions.

**✅ DO:**

```typescript
function DeleteButton({ itemId }: { itemId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setShowConfirm(true)}>
        Delete
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogAction onClick={() => handleDelete(itemId)}>
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### Testing Best Practices

#### 1. Test User Behavior, Not Implementation

Focus on what users do, not how components work.

**✅ DO:**

```typescript
test('user can submit form with valid data', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText(/email/i), 'user@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));

  await waitFor(() => {
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});
```

**❌ DON'T:**

```typescript
// Testing implementation details
test('useState is called with empty string', () => {
  const setState = jest.fn();
  React.useState = jest.fn(() => ['', setState]);
  // This is testing React, not your component
});
```

#### 2. Use Testing Library Queries Correctly

Follow the priority order for queries.

**Priority Order:**

1. `getByRole` - Accessible to everyone
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - If no label
4. `getByText` - Non-interactive elements
5. `getByDisplayValue` - Current value of input
6. `getByAltText` - Images
7. `getByTitle` - Only if nothing else works
8. `getByTestId` - Last resort

#### 3. Mock at the Network Level

Use MSW for consistent API mocking.

**✅ DO:**

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('/api/login', (req, res, ctx) => {
    return res(ctx.json({ user: mockUser, token: 'mock-token' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Development Workflow Best Practices

#### 1. Component Development Process

Follow this order when creating new components:

1. **Define types/interfaces first**
2. **Create component structure**
3. **Add functionality**
4. **Style the component**
5. **Add accessibility**
6. **Write tests**
7. **Document usage**

#### 2. Code Review Checklist

Before submitting PR, check:

- [ ] TypeScript types are properly defined (no `any`)
- [ ] Component follows single responsibility principle
- [ ] Proper error handling is in place
- [ ] Accessibility attributes are added
- [ ] Component is tested
- [ ] No console.logs left in code
- [ ] Follows naming conventions
- [ ] Uses semantic HTML
- [ ] Memoization is used appropriately
- [ ] No hardcoded strings (use constants/i18n)

#### 3. Performance Checklist

Before deploying:

- [ ] Images are optimized and use Next.js Image
- [ ] Large lists are virtualized
- [ ] Heavy components are lazy loaded
- [ ] Bundle size is checked (`ANALYZE=true pnpm build`)
- [ ] No memory leaks (cleanup in useEffect)
- [ ] API calls are debounced/throttled where appropriate
- [ ] Proper loading states are shown

### Mobile-First Development

#### 1. Responsive Design Approach

Always design for mobile first.

**✅ DO:**

```typescript
// Mobile first with Tailwind
<div className="
  p-4           // Mobile padding
  md:p-6        // Tablet padding
  lg:p-8        // Desktop padding

  grid grid-cols-1     // Mobile: 1 column
  md:grid-cols-2       // Tablet: 2 columns
  lg:grid-cols-3       // Desktop: 3 columns
">
```

#### 2. Touch-Friendly Interfaces

Ensure adequate touch targets.

**✅ DO:**

```typescript
// Minimum 44x44px touch targets
<Button className="min-h-[44px] min-w-[44px]">
  Tap me
</Button>

// Adequate spacing between interactive elements
<div className="space-y-3">  {/* At least 12px gap */}
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

### Bundle Optimization

#### 1. Tree Shaking

Import only what you need.

**✅ DO:**

```typescript
import { debounce } from 'lodash-es/debounce'; // Tree-shakeable
```

**❌ DON'T:**

```typescript
import _ from 'lodash'; // Imports entire library
const debounce = _.debounce;
```

#### 2. Dynamic Imports for Optional Features

Load features only when needed.

**✅ DO:**

```typescript
function EditorPage() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <>
      <Button onClick={() => setShowEditor(true)}>
        Open Editor
      </Button>

      {showEditor && (
        <Suspense fallback={<EditorSkeleton />}>
          <LazyEditor />  {/* Loaded only when needed */}
        </Suspense>
      )}
    </>
  );
}
```

### Debug Practices

#### 1. Development-Only Debug Tools

Remove debug code in production.

**✅ DO:**

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Or use a debug utility
import debug from 'debug';
const log = debug('app:auth');
log('User logged in', user);
```

#### 2. React DevTools Profiler

Use profiler to identify performance issues.

**✅ DO:**

```typescript
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  if (actualDuration > 16) {  // Longer than one frame
    console.warn(`Slow render in ${id}: ${actualDuration}ms`);
  }
}

<Profiler id="ExpensiveComponent" onRender={onRenderCallback}>
  <ExpensiveComponent />
</Profiler>
```

---

**Remember**: Consistency is more important than perfection. Follow these patterns exactly to maintain codebase integrity.
