'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  if (isLoading) {
    return fallback || <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return fallback || <LoadingFallback />;
  }

  return <>{children}</>;
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    </div>
  );
}