import { z } from 'zod';
import { AppError, ErrorCodes } from './errors';

// Generic API response wrapper schema
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
      })
      .optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  });

export function validateResponse<T>(data: unknown, schema: z.ZodSchema<T>, context?: string): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new AppError(
      `Invalid response format${context ? ` for ${context}` : ''}`,
      ErrorCodes.VALIDATION_ERROR,
      undefined,
      true,
      result.error.issues,
      undefined,
      false
    );
  }

  return result.data;
}

// Common response schemas
export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});

export const timestampSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Helper to create paginated response schemas
export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    pagination: paginationSchema,
  });
}

// Common response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    statusCode: z.number().optional(),
    details: z.unknown().optional(),
  }),
});

// ID response schema (for create operations)
export const idResponseSchema = z.object({
  id: z.string(),
});

// Empty response schema (for delete operations)
export const emptyResponseSchema = z.object({}).strict();

// Batch operation response schema
export const batchResponseSchema = z.object({
  succeeded: z.number(),
  failed: z.number(),
  errors: z
    .array(
      z.object({
        index: z.number(),
        error: z.string(),
      })
    )
    .optional(),
});
