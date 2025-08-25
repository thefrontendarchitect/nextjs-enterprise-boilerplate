// Auth module exports

// API
export { authApi } from './api/auth.api';
export { authMockHandlers } from './api/auth.api.mock';

// Types
export type {
  User,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from './api/types';

// Schemas (for validation)
export {
  userSchema,
  loginResponseSchema,
  refreshTokenResponseSchema,
  registerResponseSchema,
} from './api/schemas';

// Components
export { LoginForm } from './components/login-form';
export { LogoutButton } from './components/logout-button';
export { ProtectedRoute } from './components/protected-route';
export { AuthInitializer } from './components/auth-initializer';

// Hooks
export { useAuth, useAuthState, useCurrentUser, useIsAuthenticated } from './hooks/use-auth';
// useLogin removed - use unified useAuth hook instead

// Stores
export { useAuthStore, authCleanupRegistry, useAuthInitialized } from './stores/unified-auth-store';
