'use client';

import { useState, useEffect } from 'react';
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
import { useTheme, useThemeActions } from '@/shared/stores/ui-store';
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
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  Rocket,
  CheckCircle,
  Github,
  Twitter,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';

export default function Home() {
  const { t } = useI18n();
  const theme = useTheme();
  const { setTheme } = useThemeActions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    // Simple cycle through themes: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Glassmorphism */}
      <header
        className={cn(
          'fixed top-0 z-50 w-full border-b transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
            : 'border-transparent bg-transparent'
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-primary to-primary/60 opacity-50 blur-lg" />
              <div className="relative rounded-lg bg-primary p-2">
                <Code2 className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <span className="hidden text-xl font-bold md:inline">Next.js Enterprise</span>
              <span className="text-xl font-bold md:hidden">NE</span>
              <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                v15.0
              </Badge>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-4 lg:flex">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">{t('nav.login')}</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Link href="/register">
                {t('auth.signUp')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-background/95 backdrop-blur lg:hidden">
            <div className="container mx-auto space-y-3 px-4 py-4">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/login">{t('nav.login')}</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/register">{t('auth.signUp')}</Link>
              </Button>
              <div className="flex gap-2 pt-2">
                <LanguageSwitcher />
                <Button variant="outline" size="icon" onClick={toggleTheme} className="relative">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Enhanced Hero Section with Animated Gradient */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
          <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-primary/30 to-primary/10 blur-3xl" />
          <div className="animation-delay-2000 absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-primary/20 to-primary/5 blur-3xl" />
        </div>

        <div className="container relative mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Vertical Slice Architecture</span>
            <Badge variant="secondary" className="ml-1">
              NEW
            </Badge>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Enterprise Next.js
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Starter Template
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-3xl text-xl text-muted-foreground">
            Full-stack ready boilerplate with authentication, API mocking, 40+ UI components, and
            production-grade error handling. No setup required.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="group">
              <Link href="/register">
                <Rocket className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com" target="_blank">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { label: 'UI Components', value: '40+', icon: Layers },
              { label: 'TypeScript', value: '100%', icon: Shield },
              { label: 'API Mocking', value: 'Built-in', icon: Database },
              { label: 'Auth System', value: 'Ready', icon: Lock },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <div className="flex flex-col items-center space-y-2">
                  <stat.icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Overview with Cards */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <Badge className="mb-4" variant="outline">
              <Layers className="mr-1 h-3 w-3" />
              Architecture
            </Badge>
            <h2 className="mb-4 text-3xl font-bold">Vertical Slice Architecture</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Features organized by domain. Each module contains its own API, components, hooks, and
              state management - completely self-contained.
            </p>
          </div>

          <div className="mb-12 grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: Layers,
                title: 'Feature Modules',
                description: 'Self-contained modules in /src/modules/',
                features: [
                  'auth/ - Complete authentication system',
                  'API mocking with realistic delays',
                  'Zustand stores for state management',
                ],
                gradient: 'from-primary/60 to-primary/40',
              },
              {
                icon: Database,
                title: 'Smart API Client',
                description: 'Production-grade API handling',
                features: [
                  'Request deduplication (5s cache)',
                  'Automatic retry with exponential backoff',
                  'Request tracing with X-Request-ID',
                ],
                gradient: 'from-primary/50 to-primary/30',
              },
              {
                icon: GitBranch,
                title: 'Shared Resources',
                description: '40+ pre-built components',
                features: [
                  'shadcn/ui components ready to use',
                  'Dark/Light/System theme modes',
                  'Form validation with Zod schemas',
                ],
                gradient: 'from-primary/40 to-primary/20',
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="group relative overflow-hidden border-primary/10 transition-all hover:border-primary/30 hover:shadow-xl"
              >
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity group-hover:opacity-10',
                    item.gradient
                  )}
                />
                <CardHeader>
                  <div
                    className={cn(
                      'mb-2 inline-flex rounded-lg bg-gradient-to-br p-2 text-primary-foreground',
                      item.gradient
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {item.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Code Example */}
          <Card className="overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-primary" />
                <CardTitle>Clean API Organization</CardTitle>
              </div>
              <CardDescription>Module-based API structure scales to 100+ endpoints</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="overflow-x-auto p-6 text-sm">
                <code className="text-muted-foreground">{`// Type-safe API calls with Result pattern
const result = await authApi.login({ email, password });

if (result.success) {
  // TypeScript knows result.data exists
  console.log(result.data.user);
  console.log(result.data.tokens);
  router.push('/dashboard');
} else {
  // TypeScript knows result.error exists
  toast.error(result.error.message);
  console.error(result.error.code);
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="bg-muted/20 px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <Badge className="mb-4" variant="outline">
              <Zap className="mr-1 h-3 w-3" />
              Features
            </Badge>
            <h2 className="mb-4 text-3xl font-bold">What&apos;s Actually Built</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Not promises - these features are implemented and working
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: 'Authentication System',
                description:
                  'JWT tokens with auto-refresh, protected routes, session monitoring (30min timeout)',
                highlight: 'Working now',
                color: 'text-primary',
              },
              {
                icon: Lock,
                title: 'Mock API Development',
                description:
                  'Develop without backend. Realistic delays, error simulation, type-safe mocks',
                highlight: 'Zero backend',
                color: 'text-primary',
              },
              {
                icon: Globe,
                title: 'Internationalization',
                description:
                  'English, Spanish, Hindi. Cookie-based (no URL changes). Server & client support',
                highlight: '3 languages',
                color: 'text-primary',
              },
              {
                icon: Zap,
                title: 'Smart API Client',
                description:
                  'Request deduplication, automatic retry, error normalization, request tracing',
                highlight: 'Production-ready',
                color: 'text-primary',
              },
              {
                icon: Palette,
                title: '40+ UI Components',
                description:
                  'shadcn/ui components with dark mode, forms, dialogs, tables, charts - all ready',
                highlight: 'Copy & use',
                color: 'text-primary',
              },
              {
                icon: Workflow,
                title: 'State Management',
                description:
                  'Zustand for client state, React Query for server state, persistent stores',
                highlight: 'No Redux',
                color: 'text-primary',
              },
              {
                icon: TestTube,
                title: 'Error Handling',
                description:
                  'Global error boundaries, Sentry integration, typed errors with AppError class',
                highlight: 'Crash-proof',
                color: 'text-primary',
              },
              {
                icon: Code2,
                title: 'TypeScript Strict',
                description:
                  'Full type safety, path aliases, validated environment variables with Zod',
                highlight: '100% typed',
                color: 'text-primary',
              },
            ].map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack with Hover Effects */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <Badge className="mb-4" variant="outline">
              <Code2 className="mr-1 h-3 w-3" />
              Tech Stack
            </Badge>
            <h2 className="mb-4 text-3xl font-bold">Current Tech Stack</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Latest stable versions, all dependencies up to date
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {[
              {
                name: 'Next.js 15.5',
                category: 'framework',
                color: 'from-primary/60 to-primary/70',
                url: 'https://nextjs.org',
              },
              {
                name: 'React 19.1',
                category: 'library',
                color: 'from-primary/50 to-primary/60',
                url: 'https://react.dev',
              },
              {
                name: 'TypeScript 5',
                category: 'language',
                color: 'from-primary/70 to-primary/80',
                url: 'https://www.typescriptlang.org',
              },
              {
                name: 'Tailwind CSS 3.4',
                category: 'styling',
                color: 'from-primary/40 to-primary/50',
                url: 'https://tailwindcss.com',
              },
              {
                name: 'shadcn/ui',
                category: 'components',
                color: 'from-muted-foreground/60 to-muted-foreground/70',
                url: 'https://ui.shadcn.com',
              },
              {
                name: 'Radix UI',
                category: 'primitives',
                color: 'from-primary/50 to-primary/60',
                url: 'https://www.radix-ui.com',
              },
              {
                name: 'React Query 5',
                category: 'data',
                color: 'from-primary/60 to-primary/70',
                url: 'https://tanstack.com/query',
              },
              {
                name: 'Zustand 5',
                category: 'state',
                color: 'from-primary/50 to-primary/60',
                url: 'https://zustand-demo.pmnd.rs',
              },
              {
                name: 'React Hook Form 7',
                category: 'forms',
                color: 'from-primary/40 to-primary/50',
                url: 'https://react-hook-form.com',
              },
              {
                name: 'Zod 4',
                category: 'validation',
                color: 'from-primary/60 to-primary/70',
                url: 'https://zod.dev',
              },
              {
                name: 'Ky 1.9',
                category: 'http',
                color: 'from-primary/50 to-primary/60',
                url: 'https://github.com/sindresorhus/ky',
              },
              {
                name: 'Vitest 3',
                category: 'testing',
                color: 'from-primary/30 to-primary/40',
                url: 'https://vitest.dev',
              },
              {
                name: 'MSW 2',
                category: 'mocking',
                color: 'from-primary/40 to-primary/50',
                url: 'https://mswjs.io',
              },
              {
                name: 'Sentry 10',
                category: 'monitoring',
                color: 'from-primary/70 to-primary/80',
                url: 'https://sentry.io',
              },
              {
                name: 'pnpm',
                category: 'package',
                color: 'from-muted-foreground/50 to-muted-foreground/60',
                url: 'https://pnpm.io',
              },
            ].map((tech) => (
              <a
                key={tech.name}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-lg border bg-card p-4 transition-all duration-300 hover:scale-105 hover:border-primary/30 hover:shadow-lg"
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-lg bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-10',
                    tech.color
                  )}
                />
                <Badge
                  variant="outline"
                  className="absolute -right-2 -top-2 text-[10px] opacity-0 transition-all group-hover:opacity-100"
                >
                  {tech.category}
                </Badge>
                <span className="relative text-sm font-medium">{tech.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background px-4 py-20">
        <div className="container mx-auto">
          <Card className="mx-auto max-w-4xl overflow-hidden border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="relative pb-4 text-center">
              <Badge className="mx-auto mb-4" variant="default">
                <Rocket className="mr-1 h-3 w-3" />
                Quick Start
              </Badge>
              <CardTitle className="text-3xl">Get Up and Running in 5 Minutes</CardTitle>
              <CardDescription className="text-base">
                Three simple steps to start building your next project
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    step: '1',
                    title: 'Clone & Install',
                    code: 'git clone [repo]\ncd fe-boilerplate\npnpm install',
                  },
                  {
                    step: '2',
                    title: 'Configure',
                    code: 'cp .env.example .env.local\n# Edit your values',
                  },
                  {
                    step: '3',
                    title: 'Start Building',
                    code: 'pnpm dev\n# Open localhost:3000',
                  },
                ].map((item) => (
                  <div key={item.step} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                        {item.step}
                      </div>
                      <span className="font-semibold">{item.title}</span>
                    </div>
                    <pre className="rounded-lg bg-muted/50 p-3 text-xs">
                      <code>{item.code}</code>
                    </pre>
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-center gap-4 border-t pt-6 sm:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/register">
                    Start Building Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">
                    Try Demo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t bg-muted/30 px-4 py-12">
        <div className="container mx-auto">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-primary p-1.5">
                  <Code2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">Next.js Enterprise</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Production-ready boilerplate with vertical slice architecture
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="transition-colors hover:text-foreground">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="transition-colors hover:text-foreground">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="transition-colors hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Community</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Discord
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground">
                    License
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>
              © 2025 Next.js Enterprise Boilerplate. Built with ❤️ and vertical slice architecture.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  highlight,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  highlight?: string;
  color: string;
}) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:border-primary/30 hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="relative">
        <div
          className={cn(
            'mb-3 inline-flex rounded-lg p-2 transition-transform group-hover:scale-110',
            color
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        {highlight && (
          <Badge variant="secondary" className="mt-2 w-fit">
            {highlight}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="relative">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
