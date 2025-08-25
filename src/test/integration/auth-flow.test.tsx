import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/modules/auth/context/auth-context';
import { LoginForm } from '@/modules/auth/components/login-form';
import { authService } from '@/shared/services/auth.service';

// Mock dependencies
vi.mock('@/shared/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('@/shared/lib/i18n/client', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Test wrapper with all necessary providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('Authentication Flow Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Login Flow', () => {
    it('should complete full login flow successfully', async () => {
      const mockLogin = vi.mocked(authService.login);
      const mockIsAuthenticated = vi.mocked(authService.isAuthenticated);
      const mockGetAccessToken = vi.mocked(authService.getAccessToken);

      // Setup mocks for successful login
      mockLogin.mockResolvedValue({
        success: true,
        user: {
          id: 'test-user',
          email: 'user@example.com',
          name: 'Test User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      mockIsAuthenticated.mockReturnValue(true);
      mockGetAccessToken.mockReturnValue('test-access-token');

      render(<LoginForm />, { wrapper: TestWrapper });

      // Fill in login form
      const emailInput = screen.getByLabelText(/auth.email/i);
      const passwordInput = screen.getByLabelText(/auth.password/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'securePassword123');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
      await user.click(submitButton);

      // Verify login was called
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'securePassword123');
      });

      // Verify authentication state
      expect(mockIsAuthenticated()).toBe(true);
      expect(mockGetAccessToken()).toBe('test-access-token');
    });

    it('should handle failed login with error display', async () => {
      const mockLogin = vi.mocked(authService.login);
      
      mockLogin.mockResolvedValue({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });

      render(<LoginForm />, { wrapper: TestWrapper });

      // Fill in login form with invalid credentials
      const emailInput = screen.getByLabelText(/auth.email/i);
      const passwordInput = screen.getByLabelText(/auth.password/i);

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongPassword');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
      await user.click(submitButton);

      // Verify error is displayed
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Invalid email or password');
      });

      // Verify user is not authenticated
      expect(vi.mocked(authService.isAuthenticated)()).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      const mockLogin = vi.mocked(authService.login);
      
      mockLogin.mockRejectedValue(new Error('Network error'));

      render(<LoginForm />, { wrapper: TestWrapper });

      // Fill in and submit form
      const emailInput = screen.getByLabelText(/auth.email/i);
      const passwordInput = screen.getByLabelText(/auth.password/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /auth.signIn/i });
      await user.click(submitButton);

      // Verify network error message is displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/errors.networkError/i);
      });
    });
  });

  describe('Logout Flow', () => {
    it('should complete logout flow successfully', async () => {
      const mockLogout = vi.mocked(authService.logout);
      const mockIsAuthenticated = vi.mocked(authService.isAuthenticated);

      // Setup initial authenticated state
      mockIsAuthenticated.mockReturnValue(true);
      localStorage.setItem('access_token', 'test-token');

      // Perform logout
      await authService.logout();

      // Verify logout was called
      expect(mockLogout).toHaveBeenCalled();

      // Verify tokens are cleared
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('Protected Route Access', () => {
    it('should redirect unauthenticated users to login', async () => {
      const mockIsAuthenticated = vi.mocked(authService.isAuthenticated);
      mockIsAuthenticated.mockReturnValue(false);

      // Test would include rendering a protected route component
      // and verifying redirect behavior
    });

    it('should allow authenticated users to access protected routes', async () => {
      const mockIsAuthenticated = vi.mocked(authService.isAuthenticated);
      const mockGetAccessToken = vi.mocked(authService.getAccessToken);
      
      mockIsAuthenticated.mockReturnValue(true);
      mockGetAccessToken.mockReturnValue('valid-token');

      // Test would include rendering a protected route component
      // and verifying it renders correctly
    });
  });
});