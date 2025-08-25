# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
pnpm dev                 # Start dev server on http://localhost:3000
PORT=3001 pnpm dev       # Start on custom port
pnpm build              # Type-check, lint, then build for production
pnpm start              # Start production server
pnpm validate           # Run all checks (type-check, lint, test)

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Auto-fix ESLint issues
pnpm format             # Format with Prettier
pnpm type-check         # Check TypeScript types

# Testing
pnpm test               # Run unit tests with Vitest
pnpm test:ui            # Open Vitest UI
pnpm test:coverage      # Generate coverage report
pnpm test -- path/to/file.test.ts  # Run specific test file

# Bundle Analysis
ANALYZE=true pnpm build  # Generate bundle analysis report

# API Mode Switching
NEXT_PUBLIC_USE_MOCK_API=true pnpm dev   # Use mock APIs
NEXT_PUBLIC_USE_MOCK_API=false pnpm dev  # Use real APIs
```

## Architecture: Vertical Slice

This codebase uses **Vertical Slice Architecture** - features are organized by domain in `/src/modules/`, not by technical layers.

**CRITICAL RULES:**

- Modules can ONLY import from: their own module, `/src/shared/`, or external packages
- NEVER import across modules (e.g., auth module cannot import from product module)
- Each module exports public API via `index.ts` only

### Module Structure

```
/src/modules/[feature]/
├── api/
│   ├── [feature].api.ts      # API endpoints with mock wrapper
│   ├── [feature].api.mock.ts # Mock handlers (must match real API)
│   ├── schemas.ts            # Zod schemas for validation
│   └── types.ts              # TypeScript types
├── components/               # Feature-specific components
├── hooks/                    # Custom React hooks
├── stores/                   # Zustand stores
└── index.ts                  # Public exports only
```

### Shared Resources

```
/src/shared/
├── components/
│   ├── ui/          # 40+ shadcn/ui components
│   ├── forms/       # Form components with validation
│   └── layouts/     # Layout components
├── lib/
│   ├── api/         # API client, errors, interceptors
│   ├── i18n/        # Internationalization
│   ├── design-tokens/ # Design system tokens
│   └── monitoring/  # Sentry integration
├── stores/          # Global stores (ui-store)
├── hooks/           # Reusable hooks
└── types/           # Shared TypeScript types
```

## Critical Patterns to Follow

### File Naming Conventions

- Components: `kebab-case.tsx` → exports `PascalCase` component
- Hooks: `use-kebab-case.ts` → exports `useCamelCase` hook
- API files: `[feature].api.ts`, `[feature].api.mock.ts`
- Tests: `[name].test.tsx` alongside source files

### TypeScript Patterns

```typescript
// Use interface for object shapes
interface User {
  id: string;
  email: string;
}

// Use type for unions/intersections
type ApiResult<T> = { success: true; data: T } | { success: false; error: AppError };

// NEVER use enums - use const objects
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
} as const;
```

### Component Pattern

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
      <div ref={ref} className={cn('base-classes', className)} {...props}>
        {children}
      </div>
    );
  }
);

Component.displayName = 'Component';
```

### API Integration Pattern

```typescript
// ALWAYS use mock wrapper pattern
export const featureApi = {
  getData: createMockWrapper(
    mockHandlers.getData, // Mock implementation
    async (params) =>
      handleApiResponse(async () => {
        const response = await apiClient.get('/data', { params });
        return validateResponse(response, schema, 'context');
      }),
    { delay: mockDelays.standard }
  ),
};

// ALWAYS handle results with pattern matching
const result = await featureApi.getData();
if (result.success) {
  // TypeScript knows result.data exists
  console.log(result.data);
} else {
  // TypeScript knows result.error exists
  toast.error(getUserFriendlyMessage(result.error));
}
```

### Form Handling Pattern

```typescript
// ALWAYS use React Hook Form + Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
});
```

### Zustand Store Pattern

```typescript
// Prevent re-renders with selector hooks
export const useFeatureData = () => useFeatureStore((state) => state.data);

// Memoize action hooks
export const useFeatureActions = () => {
  const setData = useFeatureStore((state) => state.setData);
  return React.useMemo(() => ({ setData }), [setData]);
};
```

## API Mode Configuration

### Mock vs Real APIs

```bash
# Development with mocks (default)
NEXT_PUBLIC_USE_MOCK_API=true

# Switch to real API
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.yourapp.com
```

Components don't need to know which mode is active - the API layer handles it transparently.

## Error Handling

### AppError Pattern

```typescript
// All errors must be AppError instances
throw new AppError(
  'User not found',
  ErrorCodes.NOT_FOUND,
  404,
  true, // isOperational
  { userId: id } // details
);

// Normalize unknown errors
const appError = normalizeError(error);
```

### API Result Pattern

```typescript
// All API calls return ApiResult<T>
type ApiResult<T> = { success: true; data: T } | { success: false; error: AppError };
```

## Authentication Flow

1. JWT tokens stored in localStorage
2. Automatic token refresh on 401 responses
3. Session timeout after 30 minutes of inactivity
4. Token refresh queue prevents concurrent refresh attempts
5. Cleanup registry manages intervals and subscriptions

## Styling Rules

### Always use cn() utility

```typescript
import { cn } from '@/shared/lib/utils/cn';

className={cn(
  'base-classes',
  isActive && 'active-classes',
  className  // Allow prop override
)}
```

### Theme-aware colors only

```typescript
// ✅ DO: Use semantic variables
className = 'bg-background text-foreground border-border';

// ❌ DON'T: Use explicit colors
className = 'bg-white dark:bg-black';
```

## Testing Guidelines

- Use Vitest for unit tests
- Use Testing Library for component tests
- Mock at the API level, not component level
- Test user behavior, not implementation
- Global mocks configured in `/src/test/setup.ts`

## Performance Considerations

- GET requests are automatically deduplicated (5s cache)
- Failed requests retry with exponential backoff (max 3 attempts)
- Use React Query for server state (never Zustand)
- Memoize expensive computations with useMemo
- Lazy load heavy components and routes

## Common Pitfalls to Avoid

1. **Cross-module imports** - Will break module boundaries
2. **Using any type** - Use unknown and validate
3. **Direct process.env access** - Use validated env object
4. **Storing server state in Zustand** - Use React Query
5. **Index as list key** - Use stable unique IDs
6. **Mutating state** - Always create new objects/arrays
7. **Missing error boundaries** - Wrap feature sections
8. **Synchronizing derived state** - Calculate instead

## Documentation References

For comprehensive patterns and examples, see:

- `/docs/AI_PATTERNS.md` - Complete coding patterns guide
- `/docs/DESIGN_TOKENS.md` - Design system documentation
- `/docs/OPTIMIZATION_PATTERNS.md` - Performance patterns
