# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
pnpm dev                 # Start dev server on http://localhost:3000
pnpm build              # Type-check, lint, then build for production
pnpm start              # Start production server
pnpm validate           # Run all checks (type-check, lint, test)
```

### Code Quality
```bash
pnpm lint               # Run ESLint
pnpm lint:fix           # Auto-fix ESLint issues
pnpm format             # Format with Prettier
pnpm type-check         # Check TypeScript types
```

### Testing
```bash
pnpm test               # Run unit tests with Vitest
pnpm test:ui            # Open Vitest UI
pnpm test:coverage      # Generate coverage report
pnpm test -- path/to/file.test.ts  # Run specific test file
```

## Architecture Overview

This codebase implements **Vertical Slice Architecture** where features are organized by domain, not technical layers.

### Module Organization (`/src/modules/`)
Each module is self-contained with:
- `api/` - Module-specific API endpoints and types
- `components/` - Feature-specific components
- `hooks/` - Custom React hooks
- `stores/` - Zustand stores for module state
- `context/` - React contexts
- `index.ts` - Public module exports

Example: The `auth` module contains everything related to authentication - API calls, login form, auth context, and auth store.

### Shared Resources (`/src/shared/`)
- `components/ui/` - shadcn/ui components (Radix UI + Tailwind)
- `lib/api/` - API client with circuit breaker pattern
- `lib/i18n/` - Internationalization utilities (cookie-based, no URL pollution)
- `stores/` - Global application stores (theme, preferences)
- `hooks/` - Reusable React hooks

### API Client Pattern
The API client (`/src/shared/lib/api/client.ts`) implements:
- Circuit breaker for resilience
- Automatic retry with exponential backoff
- Request deduplication for GET requests
- JWT token injection via interceptors
- Standardized error handling with `ApiResult<T>` pattern

### State Management Strategy
- **Server State**: React Query for API data caching and synchronization
- **Client State**: Zustand for UI state and user preferences
- **Form State**: React Hook Form with Zod validation
- **Auth State**: Hybrid approach using Context + Zustand

### Authentication Flow
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token refresh with deduplication
- Protected routes via `(auth)` route group
- Public routes via `(public)` route group with authenticated user redirects

### Internationalization
- Cookie-based locale storage (no URL changes)
- Middleware handles automatic locale detection
- Works with both Server and Client Components
- Translations in `/src/translations/`

### Testing Approach
- Unit tests co-located with components
- Test utilities in `/src/test/utils/`
- MSW for API mocking
- Custom test-utils.tsx with providers wrapper

### Design System
- CSS variables for semantic color tokens in `globals.css`
- Dark mode support via `.dark` class
- All colors defined as HSL values
- Automatic theme switching based on system preference

## Key Implementation Details

### When Adding New Features
1. Create a new module in `/src/modules/[feature-name]/`
2. Export public API from module's `index.ts`
3. Keep module-specific logic within the module
4. Use shared components and utilities from `/src/shared/`

### API Integration
- Define API types in module's `api/types.ts`
- Create API functions in module's `api/[endpoint].ts`
- Use the centralized API client from `/src/shared/lib/api/`
- Handle errors with `ApiResult<T>` pattern

### Component Development
- Use shadcn/ui components from `/src/shared/components/ui/`
- Follow compound component pattern for complex UIs
- Ensure accessibility with proper ARIA attributes
- Support dark mode using semantic color tokens

### Form Handling
- Use React Hook Form for form state
- Define Zod schemas for validation
- Create reusable form components in `/src/shared/components/forms/`
- Handle API errors in form submission

### Performance Considerations
- Module-based code splitting is automatic
- Use React Query for server state caching
- Implement optimistic updates where appropriate
- Lazy load heavy components

## Environment Configuration
- Environment variables validated with Zod in `/src/config/env.ts`
- Required variables will fail build if missing
- Use `NEXT_PUBLIC_` prefix for client-side variables