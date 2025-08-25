'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginFormData } from '@/shared/lib/utils/validators';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { FormInput } from '@/shared/components/forms/form-input';
import { FormCheckbox } from '@/shared/components/forms/form-checkbox';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/shared/services/auth.service';
import { useI18n } from '@/shared/lib/i18n/client';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useI18n();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const result = await authService.login(data.email, data.password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error?.message || t('auth.loginError'));
      }
    } catch {
      setError(t('errors.networkError'));
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        aria-label="Login form"
        noValidate
      >
        {error && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <FormInput
          name="email"
          label={t('auth.email')}
          type="email"
          placeholder={t('auth.email')}
          autoComplete="email"
        />
        
        <FormInput
          name="password"
          label={t('auth.password')}
          type="password"
          placeholder={t('auth.password')}
          autoComplete="current-password"
        />
        
        <div className="flex items-center justify-between">
          <FormCheckbox
            name="rememberMe"
            label={t('auth.rememberMe')}
          />
          
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {t('auth.signIn')}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            {t('auth.signUp')}
          </Link>
        </p>
      </form>
    </Form>
  );
}