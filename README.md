# Frontend Boilerplate

Production-ready Next.js 15 enterprise boilerplate with vertical slice architecture.

## What This Boilerplate Provides

- **Working authentication system** with JWT tokens, auto-refresh, and session monitoring
- **Mock API development** - develop without a backend using realistic mock data
- **40+ pre-configured UI components** from shadcn/ui with dark mode support
- **Internationalization** in 3 languages (EN, ES, HI) without URL pollution
- **Error boundaries** with Sentry integration for production monitoring
- **Form validation** with React Hook Form + Zod schemas
- **API client** with retry logic and request deduplication
- **Type-safe everything** with TypeScript strict mode

## Quick Start

```bash
# Clone and install
git clone [repo-url]
cd fe-boilerplate
pnpm install

# Configure environment
cp .env.example .env.local

# Start development
pnpm dev
```

Access at http://localhost:3000

## Project Structure

```
src/
├── app/                # Next.js 15 app router
│   ├── (auth)/        # Protected routes (requires login)
│   └── (public)/      # Public routes
├── modules/           # Feature modules (vertical slices)
│   └── auth/         # Authentication module
│       ├── api/      # API endpoints & mocks
│       ├── components/
│       ├── hooks/
│       └── stores/   # Zustand state
└── shared/           # Shared across modules
    ├── components/ui/ # shadcn/ui components
    ├── lib/api/      # API client & error handling
    └── stores/       # Global state (theme, preferences)
```

## Available Routes

- `/` - Landing page with feature showcase
- `/login` - Login form (mock credentials: any email/password)
- `/register` - Registration form
- `/dashboard` - Protected dashboard (requires authentication)

## Scripts

```bash
pnpm dev        # Development server
pnpm build      # Production build
pnpm test       # Run tests
pnpm lint       # Lint code
pnpm type-check # TypeScript checking
```

## Features in Detail

### Authentication

- Login/Register/Logout flows
- JWT token management with refresh
- Protected route groups
- 30-minute session timeout
- Mock authentication for development

### API Integration

- **Request Deduplication**: Caches GET requests for 5 seconds
- **Automatic Retry**: Exponential backoff for failed requests (3 retries max)
- **Token Refresh on 401**: Automatically refreshes token and retries request
- **Mock API**: Seamless switching between mock and real APIs

### State Management

- **Zustand** for client state
- **React Query** for server state
- **Persistent stores** with localStorage
- **Optimized selectors** to prevent re-renders

### UI/UX

- **Dark/Light/System** theme modes
- **Responsive design** with Tailwind CSS
- **Loading states** and error boundaries
- **Toast notifications** for user feedback
- **Accessible components** with ARIA support

### Developer Experience

- **TypeScript** with strict mode
- **Path aliases** (@/ imports)
- **Hot reload** in development
- **Git hooks** with Husky
- **Code formatting** with Prettier
- **Bundle analyzer** for optimization

## Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
NEXT_PUBLIC_USE_MOCK_API=true    # Use mock API
NEXT_PUBLIC_SENTRY_DSN=          # Error tracking
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library
- **API Client**: Ky
- **Package Manager**: pnpm

## API Patterns

All API calls follow the Result pattern:

```typescript
const result = await authApi.login(credentials);
if (result.success) {
  // Access result.data
} else {
  // Handle result.error
}
```

## Adding New Features

1. Create module in `/src/modules/[feature]/`
2. Add API endpoints with mock handlers
3. Create components, hooks, and stores
4. Export public API in `index.ts`

## Performance

- Route-based code splitting
- Image optimization with Next.js Image
- Font optimization with next/font
- Request deduplication (5s cache)
- CSS purging in production

## Security

- JWT secure storage
- Token auto-refresh
- Input validation with Zod
- XSS protection (React default)
- Environment variable validation
- Request ID tracking

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
