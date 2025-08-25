import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates all environment variables at build time and runtime
 */
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  
  // Features
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),
  
  // Development
  NEXT_PUBLIC_USE_MOCK_API: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),
  
  // Development
  ANALYZE: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),
  
  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Parse and validate environment variables
 * This will throw an error if any required variables are missing
 */
const parseEnv = () => {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
      NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
      NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
      ANALYZE: process.env.ANALYZE,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
      throw new Error('Invalid environment variables');
    }
    throw error;
  }
};

/**
 * Validated environment variables
 * Use this throughout the app instead of process.env
 */
export const env = parseEnv();

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Helper to check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Helper to check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Helper to check if we're in test
 */
export const isTest = env.NODE_ENV === 'test';