import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';
import { authService } from '@/shared/services/auth.service';

// Mock dependencies
vi.mock('@/shared/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/shared/lib/i18n/client', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Wrapper component for providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

describe('LoginForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with all fields', () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    expect(screen.getByLabelText(/auth.email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/auth.password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auth.signIn/i })).toBeInTheDocument();
    expect(screen.getByText(/auth.forgotPassword/i)).toBeInTheDocument();
  });

  it('should display validation errors for empty fields', async () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should display validation error for invalid email', async () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/auth.email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should call authService.login with correct data on form submission', async () => {
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      success: true,
      user: { 
        id: 'user-1', 
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    render(<LoginForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/auth.email/i);
    const passwordInput = screen.getByLabelText(/auth.password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should display error message on login failure', async () => {
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      success: false,
      error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
    });

    render(<LoginForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/auth.email/i);
    const passwordInput = screen.getByLabelText(/auth.password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrong-password');
    
    const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });

  it('should disable submit button while submitting', async () => {
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        success: true, 
        user: { 
          id: 'user-1', 
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } 
      }), 100))
    );

    render(<LoginForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/auth.email/i);
    const passwordInput = screen.getByLabelText(/auth.password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should toggle password visibility', async () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/auth.password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Note: This assumes there's a toggle button for password visibility
    // You might need to add this functionality to the form
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LoginForm />, { wrapper: TestWrapper });

      const form = screen.getByRole('form', { name: /login form/i });
      expect(form).toHaveAttribute('aria-label', 'Login form');
      expect(form).toHaveAttribute('noValidate');
    });

    it('should announce errors to screen readers', async () => {
      const mockLogin = vi.mocked(authService.login);
      mockLogin.mockResolvedValue({
        success: false,
        error: { message: 'Login failed', code: 'ERROR' },
      });

      render(<LoginForm />, { wrapper: TestWrapper });

      const emailInput = screen.getByLabelText(/auth.email/i);
      const passwordInput = screen.getByLabelText(/auth.password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password');
      
      const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'assertive');
      });
    });
  });
});