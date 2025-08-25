'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ThemeSwitcher } from '@/shared/components/theme-switcher';
import { LanguageSwitcher } from '@/shared/components/language-switcher';
import { useI18n } from '@/shared/lib/i18n/client';
import {
  ArrowRight,
  Code2,
  Zap,
  Shield,
  Globe,
  Layers,
  GitBranch,
  Database,
  Lock,
  Palette,
  TestTube,
  Workflow,
  FileCode2,
} from 'lucide-react';

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Next.js Enterprise Boilerplate</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button variant="ghost" asChild>
              <Link href="/login">{t('nav.login')}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t('auth.signUp')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted/20 px-4 py-20">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            Vertical Slice Architecture
          </Badge>
          <h1 className="mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-5xl font-bold text-transparent">
            Production-Ready Next.js 15 Boilerplate
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-muted-foreground">
            Built with vertical slice architecture, module-based API organization, and
            enterprise-grade patterns. Start building scalable applications with confidence.
          </p>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Vertical Slice Architecture</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Organized by features, not layers. Each module is self-contained with its own API,
              components, hooks, and services.
            </p>
          </div>

          <div className="mb-12 grid gap-6 lg:grid-cols-3">
            <Card className="border-primary/20">
              <CardHeader>
                <Layers className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Feature Modules</CardTitle>
                <CardDescription>
                  Self-contained modules in <code className="text-xs">/src/modules/</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <div>
                      <strong>auth/</strong> - Authentication & authorization
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <div>
                      <strong>user/</strong> - User management
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <div>
                      <strong>dashboard/</strong> - Analytics & metrics
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <Database className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Module API Pattern</CardTitle>
                <CardDescription>Each module owns its API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <div>
                      <strong>api/</strong> - Module-specific endpoints
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <div>
                      <strong>types/</strong> - Local type definitions
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <div>
                      <strong>Circuit breaker</strong> - Resilient API calls
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <GitBranch className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Shared Resources</CardTitle>
                <CardDescription>
                  Reusable utilities in <code className="text-xs">/src/shared/</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <div>
                      <strong>components/ui/</strong> - shadcn/ui components
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <div>
                      <strong>lib/api/</strong> - API infrastructure
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <div>
                      <strong>hooks/</strong> - Reusable React hooks
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Code Example */}
          <Card className="bg-muted/30">
            <CardHeader>
              <FileCode2 className="mb-2 h-6 w-6 text-primary" />
              <CardTitle>Clean API Organization</CardTitle>
              <CardDescription>Module-based API structure scales to 100+ endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-background p-4 text-sm">
                <code>{`// Import from module, not shared endpoints
import { authApi } from '@/modules/auth';
import { userApi } from '@/modules/user';
import { dashboardApi } from '@/modules/dashboard';

// Type-safe API calls with error handling
const result = await authApi.login({ email, password });
if (result.success) {
  // Handle success with result.data
} else {
  // Handle error with result.error
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Features */}
      <section className="bg-muted/20 px-4 py-20">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold">Enterprise-Ready Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Type-Safe Everything"
              description="Full TypeScript with strict mode, path aliases, and comprehensive type coverage"
              highlight="TypeScript 5"
            />
            <FeatureCard
              icon={<Lock className="h-8 w-8" />}
              title="JWT Authentication"
              description="Client-side JWT auth with refresh tokens, protected routes, and auth context"
              highlight="Zero-config auth"
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8" />}
              title="Cookie-based i18n"
              description="Clean URLs without locale prefix, automatic detection, server & client support"
              highlight="No URL pollution"
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="API Circuit Breaker"
              description="Resilient API client with automatic retry, exponential backoff, and failure protection"
              highlight="99.9% uptime"
            />
            <FeatureCard
              icon={<Palette className="h-8 w-8" />}
              title="Design System"
              description="Semantic design tokens, CSS variables, dark mode, and shadcn/ui components"
              highlight="Radix UI"
            />
            <FeatureCard
              icon={<Workflow className="h-8 w-8" />}
              title="State Management"
              description="React Query for server state, Zustand for client state, React Hook Form for forms"
              highlight="Optimized DX"
            />
            <FeatureCard
              icon={<TestTube className="h-8 w-8" />}
              title="Testing Suite"
              description="Vitest for unit tests, Playwright for E2E, MSW for API mocking"
              highlight="100% coverage ready"
            />
            <FeatureCard
              icon={<Code2 className="h-8 w-8" />}
              title="Developer Tools"
              description="ESLint, Prettier, Husky, lint-staged, commitlint, and Sentry integration"
              highlight="Git hooks included"
            />
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <h2 className="mb-4 text-center text-3xl font-bold">Modern Tech Stack</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Built with the latest stable versions and best practices for 2025
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {[
              { name: 'Next.js 15', category: 'framework' },
              { name: 'React 19', category: 'framework' },
              { name: 'TypeScript 5', category: 'language' },
              { name: 'Tailwind CSS', category: 'styling' },
              { name: 'shadcn/ui', category: 'components' },
              { name: 'Radix UI', category: 'components' },
              { name: 'React Query', category: 'state' },
              { name: 'Zustand', category: 'state' },
              { name: 'React Hook Form', category: 'forms' },
              { name: 'Zod', category: 'validation' },
              { name: 'ky', category: 'api' },
              { name: 'js-cookie', category: 'api' },
              { name: 'Vitest', category: 'testing' },
              { name: 'Playwright', category: 'testing' },
              { name: 'MSW', category: 'testing' },
              { name: 'Sentry', category: 'monitoring' },
              { name: 'Husky', category: 'tools' },
              { name: 'ESLint', category: 'tools' },
              { name: 'Prettier', category: 'tools' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="group relative rounded-lg border bg-card p-4 transition-all duration-200 hover:border-primary/20 hover:bg-accent"
              >
                <Badge
                  variant="outline"
                  className="absolute -right-2 -top-2 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {tech.category}
                </Badge>
                <span className="text-sm font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="bg-muted/20 px-4 py-20">
        <div className="container mx-auto">
          <Card className="mx-auto max-w-4xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Quick Start</CardTitle>
              <CardDescription>Get up and running in under 5 minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Badge>1</Badge> Clone & Install
                  </div>
                  <pre className="rounded bg-background p-3 text-xs">
                    <code>{`git clone [repo]
cd fe-boilerplate
pnpm install`}</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Badge>2</Badge> Configure Environment
                  </div>
                  <pre className="rounded bg-background p-3 text-xs">
                    <code>{`cp .env.example .env.local
# Edit .env.local with your values`}</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Badge>3</Badge> Start Development
                  </div>
                  <pre className="rounded bg-background p-3 text-xs">
                    <code>{`pnpm dev
# Open http://localhost:3000`}</code>
                  </pre>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button asChild size="lg">
                  <Link href="/register">
                    Start Building Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12">
        <div className="container mx-auto">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-3 font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-foreground">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Home
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Twitter
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    License
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Next.js Enterprise Boilerplate. Built with vertical slice architecture.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}) {
  return (
    <Card className="group transition-all duration-200 hover:border-primary/20 hover:shadow-lg">
      <CardHeader>
        <div className="mb-2 text-primary transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        {highlight && (
          <Badge variant="secondary" className="mt-1 w-fit">
            {highlight}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
