'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/unified-auth-store';
import { useToast } from '@/shared/hooks/use-toast';
// Unified auth hook providing both state and actions

/**
 * Unified auth hook that provides both state and actions
 * Replaces the previous useAuthContext, useAuthState, and useAuth hooks
 */
export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();

  // Get state from unified store
  const {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    register: storeRegister,
    refreshUser,
  } = useAuthStore();

  // Enhanced login with toast notifications and routing
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const success = await storeLogin(email, password);

      if (success && user) {
        toast({
          title: 'Welcome back!',
          description: `Successfully logged in as ${user.name || user.email}`,
        });
        router.push('/dashboard');
        return true;
      } else {
        toast({
          title: 'Login failed',
          description: 'Please check your credentials and try again.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [storeLogin, user, toast, router]
  );

  // Enhanced logout with toast notifications and routing
  const logout = useCallback(async (): Promise<void> => {
    await storeLogout();

    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });

    router.push('/login');
  }, [storeLogout, toast, router]);

  // Enhanced register with toast notifications and routing
  const register = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      const success = await storeRegister(email, password, name);

      if (success) {
        toast({
          title: 'Welcome!',
          description: 'Your account has been created successfully.',
        });
        router.push('/dashboard');
        return true;
      } else {
        toast({
          title: 'Registration failed',
          description: 'Please check your information and try again.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [storeRegister, toast, router]
  );

  // Enhanced refresh user with error handling
  const handleRefreshUser = useCallback(async (): Promise<void> => {
    try {
      await refreshUser();
    } catch {
      toast({
        title: 'Session expired',
        description: 'Please login again to continue.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [refreshUser, toast, router]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,

    // Actions with enhanced UX
    login,
    logout,
    register,
    refreshUser: handleRefreshUser,
  };
}

/**
 * Hook for components that only need auth state (no actions)
 * Optimized for minimal re-renders
 */
export function useAuthState() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return { user, isAuthenticated, isLoading };
}

/**
 * Hook for getting just the current user
 * Useful for display components
 */
export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

/**
 * Hook for checking authentication status
 * Useful for conditional rendering
 */
export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated);
}
