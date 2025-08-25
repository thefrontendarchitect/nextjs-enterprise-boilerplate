import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';

// Mock dependencies
vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn(),
    isAuthenticated: false,
  }),
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

  it('should render login form with email and password fields', () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login.submit/i })).toBeInTheDocument();
  });

  it('should show validation errors when fields are empty', async () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const submitButton = screen.getByRole('button', { name: /login.submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/validation.email.required/i)).toBeInTheDocument();
      expect(screen.getByText(/validation.password.required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email format', async () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /login.submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/validation.email.invalid/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while submitting', async () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login.submit/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('should toggle remember me checkbox', async () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const checkbox = screen.getByRole('checkbox', { name: /login.rememberMe/i });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
