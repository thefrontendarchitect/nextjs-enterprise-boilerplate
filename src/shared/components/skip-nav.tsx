import { cn } from '@/shared/lib/utils';

export function SkipNav() {
  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only',
        'absolute top-4 left-4 z-50',
        'rounded-md bg-background px-4 py-2',
        'border border-input',
        'text-sm font-medium',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'focus:ring-offset-background'
      )}
    >
      Skip to main content
    </a>
  );
}