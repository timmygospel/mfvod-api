import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
