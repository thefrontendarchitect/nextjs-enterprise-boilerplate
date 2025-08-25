'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/shared/services/auth.service';
import { useToast } from '@/shared/hooks/use-toast';
import type { User } from '@/shared/types/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user!);
        toast({
          title: 'Success',
          description: 'Successfully logged in!',
        });
        router.push('/dashboard');
        return true;
      } else {
        toast({
          title: 'Error',
          description: result.error?.message || 'Invalid email or password',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}