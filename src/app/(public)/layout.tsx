'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/modules/auth/hooks/use-auth';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show children immediately while checking auth
  // This prevents flash of content for public pages
  return <>{children}</>;
}
