'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/shared/services/auth.service';
import { useToast } from '@/shared/hooks/use-toast';
import type { LoginFormData } from '@/shared/lib/utils/validators';

export function useLogin() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const result = await authService.login(data.email, data.password);
      if (!result.success) {
        throw new Error(result.error?.message || 'Login failed');
      }
      return result.user!;
    },
    onSuccess: (user) => {
      setIsRedirecting(true);
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.email}`,
      });
      
      // Redirect to dashboard (role-based routing can be added later)
      const redirectUrl = '/dashboard';
      
      router.push(redirectUrl);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message,
      });
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending || isRedirecting,
    error: mutation.error,
  };
}

// Hook for checking authentication status
export function useAuthStatus() {
  const router = useRouter();
  
  const checkAuth = async () => {
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  };

  return { checkAuth };
}