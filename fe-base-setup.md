# Next.js Frontend Stack – Final Best-Fit Spec (2025)

This document locks the final, production-ready frontend stack for our Next.js applications with cloud-hosted APIs. It includes library choices, rationale, setup commands, directory conventions, and usage patterns.

---

## 1) Core Framework & Language

* **Framework:** Next.js (App Router, RSC, Server Actions where useful)
* **Language:** TypeScript (strict)
* **Package Manager:** pnpm
* **Monorepo (optional):** Nx or Turborepo (if multiple packages/services)

**Why:** Industry-standard DX, first-class SSR/RSC, streaming, and rich ecosystem.

---

## 2) UI & Styling

* **Styling:** Tailwind CSS
* **Component primitives:** shadcn/ui (Radix under the hood)
* **Icons:** lucide-react
* **Animations:** Framer Motion (only where needed)

**Why:** Accessible, composable primitives + utility-first styling = fast delivery without vendor lock-in.

---

## 3) API Handling (Cloud-hosted, out-of-repo)

* **Transport:** `ky` (fetch wrapper)
* **Typing:** `openapi-typescript` (generate TS types from OpenAPI spec)
* **Runtime validation (selective):** `zod`

**Why:** Clean separation from backend, strictly typed contracts, light client.

**Notes**

* Re-generate types on CI or postinstall.
* Keep a thin `/lib/api` layer (client + endpoint helpers) to isolate HTTP concerns.

---

## 4) Data Fetching & Caching (Server State)

* **Library:** `@tanstack/react-query` (+ Devtools in dev)

**Why:** Battle-tested cache, retries, mutations, optimistic UX, and easy RSC boundary integration.

**Defaults**

* `staleTime: 30s`, `retry: 2`, `refetchOnWindowFocus: false`.

---

## 5) Client State (UI/Local Only)

* **Library:** `zustand` (+ `persist` and `immer` as needed)

**Use cases:** UI toggles, wizard steps, filters, ephemeral selections. Avoid server-derived data here.

---

## 6) Internationalization

* **Library:** `next-intl`
* **Routing:** `/app/[locale]/...` with middleware detection
* **Catalogs:** `/messages/en.json`, `/messages/hi.json`, etc.

**Why:** App Router–native ergonomics, simple APIs for server/client components.

---

## 7) Validation & Contracts

* **Library:** `zod` (shared schemas in `/schemas`)
* **Optional:** `zod-to-openapi` on server projects to co-generate spec

**Pattern:** Define once → reuse for form validation (RHF), endpoint inputs, and critical response parsing.

---

## 8) Forms

* **Libraries:** `react-hook-form` + `@hookform/resolvers/zod`
* **UI:** shadcn `<Form />` wrapper, toast-based error surfacing

**Why:** Great performance and composability with TS.

---

## 9) Authentication

* **Primary:** Bearer access token in Authorization header
* **Refresh:** HTTP-only cookie–backed refresh endpoint (silent refresh)
* **Alt (same-site apps):** First-party HTTP-only cookies + `credentials: 'include'`

**Why:** Works across separate cloud APIs while remaining secure and scalable.

---

## 10) Observability & Resilience

* **Errors/Tracing:** `@sentry/nextjs`
* **Logging:** Structured server logs (pino or platform-native) + requestId propagation
* **Retries/Timeouts:** In `ky` + React Query defaults
* **Tracing header:** Forward `traceparent` from Route Handlers to API

---

## 11) Revalidation & Caching (Next.js features)

* Use `fetch(..., { next: { revalidate: N } })` in Server Components for static-ish public data.
* Use **tags** + `revalidateTag()` after mutations where appropriate.
* Prefer React Query for dynamic, interactive dashboards and user data.

---

## 12) Directory & Module Layout

```
src/
  app/
    (providers)/providers.tsx
    [locale]/
      layout.tsx
      page.tsx
  components/
  features/
    <domain>/
      components/
      queries.ts
      mutations.ts
  lib/
    api/
      client.ts
      endpoints.ts
    i18n/
    utils/
  schemas/
  stores/
  types/
    openapi.d.ts
  styles/
```

---

## 13) Dependencies

**Runtime**

* next, react, react-dom, typescript
* tailwindcss, class-variance-authority, tailwind-merge
* @radix-ui/react-\* (via shadcn/ui), lucide-react, framer-motion
* ky, zod, @tanstack/react-query, react-hook-form, @hookform/resolvers
* next-intl, zustand
* @sentry/nextjs

**Dev**

* openapi-typescript, @tanstack/react-query-devtools, eslint, prettier, vitest (unit), playwright (e2e)

---

## 14) Setup Commands (Quickstart)

```bash
# Base
pnpm add ky zod @tanstack/react-query react-hook-form @hookform/resolvers next-intl zustand @sentry/nextjs lucide-react framer-motion
pnpm add -D openapi-typescript @tanstack/react-query-devtools

# Tailwind + shadcn (if not scaffolded)
npx tailwindcss init -p
npx shadcn@latest init -d
npx shadcn@latest add button input form dialog drawer dropdown-menu popover tooltip sheet alert toast skeleton table tabs accordion scroll-area badge separator progress avatar card
```

---

## 15) Key Boilerplate Snippets

**React Query Provider** (`src/app/(providers)/providers.tsx`):

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 2, refetchOnWindowFocus: false },
      mutations: { retry: 1 }
    }
  }));
  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**API Client** (`src/lib/api/client.ts`):

```ts
import ky from 'ky';

export const createApi = ({ baseUrl, getAccessToken, onUnauthorized }: {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
  onUnauthorized?: () => Promise<void> | void;
}) => ky.create({
  prefixUrl: baseUrl,
  hooks: {
    beforeRequest: [async (req) => {
      const token = await getAccessToken?.();
      if (token) req.headers.set('Authorization', `Bearer ${token}`);
    }],
    afterResponse: [async (_req, _opts, res) => {
      if (res.status === 401) await onUnauthorized?.();
    }]
  },
  retry: { limit: 2, methods: ['get','put','post','patch','delete'] },
  timeout: 15_000,
});
```

**Endpoint Helper** (`src/lib/api/endpoints.ts`):

```ts
import { createApi } from './client';
import type { paths } from '@/types/openapi';

const api = createApi({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  getAccessToken: () => (typeof window !== 'undefined' ? localStorage.getItem('access') : null),
});

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; status: number; message?: string };
export type Result<T> = Ok<T> | Err;

export async function getMe(): Promise<Result<paths['/v1/users/me']['get']['responses']['200']['content']['application/json']>> {
  try {
    const data = await api.get('v1/users/me').json();
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, status: e.response?.status ?? 0, message: e.message };
  }
}
```

**i18n** (`middleware.ts`):

```ts
import createMiddleware from 'next-intl/middleware';
export default createMiddleware({
  locales: ['en','hi'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
export const config = { matcher: ['/((?!_next|.*\\..*).*)'] };
```

---

## 16) Guardrails & Conventions

* Keep server data in React Query; keep UI-only flags in Zustand.
* Standardize API error shape: `{ error: { code, message, details, requestId } }` and surface `requestId` in Sentry breadcrumbs.
* Use shadcn primitives for all interactive elements (dialogs, menus, tooltips) to guarantee a11y.
* Co-locate feature code under `src/features/<domain>` with queries/mutations/components.
* Prefer Server Components for static-ish content; use client components for interactive views.

---

## 17) Trade-offs (Accepted)

* We avoid heavy, theme-opinionated UI kits (MUI/AntD) to keep brand flexibility.
* We choose typed REST over GraphQL/tRPC for clean boundaries to cloud APIs.
* Minimal client-side global state to reduce complexity and bugs.

---

## 18) What “Done” Looks Like

* ✅ Types generated from OpenAPI and committed
* ✅ API client + endpoint helpers in `/lib/api`
* ✅ React Query wired with sensible defaults
* ✅ `next-intl` routing + two locales
* ✅ shadcn/ui baseline components installed
* ✅ Sample form (RHF + Zod) and a sample table (TanStack Table)
* ✅ Sentry initialized with DSN & traces

---

## 19) Environment

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# Optional
auth domain/cookies per environment
```

---

**This spec is the authoritative source for our frontend build.** Update in PRs if we change direction.
