'use client';

import { useEffect } from 'react';
import { useAuthStore, authCleanupRegistry } from '../stores/unified-auth-store';

/**
 * AuthInitializer component handles authentication initialization and cleanup.
 * This component should be placed at the root of the app to ensure proper
 * initialization and cleanup of auth-related side effects.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const startSessionMonitoring = useAuthStore((state) => state.startSessionMonitoring);
  const startActivityTracking = useAuthStore((state) => state.startActivityTracking);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Initialize auth state only once
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Register cleanup functions only once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Start session monitoring and register cleanup
    const sessionCleanup = startSessionMonitoring();
    authCleanupRegistry.register(sessionCleanup);

    // Start activity tracking and register cleanup
    const activityCleanup = startActivityTracking();
    authCleanupRegistry.register(activityCleanup);

    // Cleanup on unmount
    return () => {
      authCleanupRegistry.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return <>{children}</>;
}
