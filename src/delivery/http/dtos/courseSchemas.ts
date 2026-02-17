import { z } from 'zod';

export const createCourseSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export const updateCourseSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateCourseBody = z.infer<typeof createCourseSchema>;
export type UpdateCourseBody = z.infer<typeof updateCourseSchema>;
