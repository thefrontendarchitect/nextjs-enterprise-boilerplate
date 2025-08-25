import { authApi } from '@/modules/auth';
import type { User } from '@/modules/auth';
import type { AuthTokens } from '@/shared/types/auth';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

class AuthService {
  private user: User | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  // Token management
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Refresh token should be in httpOnly cookie, but for demo we use localStorage
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.user = null;
  }

  // Authentication methods
  async login(email: string, password: string) {
    const result = await authApi.login({ email, password });

    if (result.success) {
      this.setTokens({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      });
      this.user = result.data.user;
      return { success: true, user: result.data.user };
    }

    return { success: false, error: result.error };
  }

  async logout() {
    try {
      await authApi.logout();
      this.clearTokens();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      this.clearTokens();
      return { success: false, error: { message: 'Logout failed' } };
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        const result = await authApi.refresh(refreshToken);

        if (result.success) {
          localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
          return result.data.accessToken;
        }

        this.clearTokens();
        return null;
      } catch (error) {
        console.error('Token refresh error:', error);
        this.clearTokens();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.user) return this.user;

    const token = this.getAccessToken();
    if (!token) return null;

    const result = await authApi.getMe();

    if (result.success) {
      this.user = result.data;
      return result.data;
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
