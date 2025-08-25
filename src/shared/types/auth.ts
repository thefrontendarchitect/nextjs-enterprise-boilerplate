export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'admin' | 'moderator';
  avatar?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}