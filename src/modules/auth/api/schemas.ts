import { z } from 'zod';
import { timestampSchema } from '@/shared/lib/api/validators';

// User schema
export const userSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatar: z.string().optional(),
  })
  .merge(timestampSchema);

// Auth response schemas
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});

export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
});

export const registerResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});

// Infer types from schemas
export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
