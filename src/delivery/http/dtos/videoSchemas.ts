import { z } from 'zod';

export const createVideoSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived', 'disabled']).optional(),
  courseId: z.string().uuid(),
  sortOrder: z.number().int().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  muxAssetId: z.string().nullable().optional(),
  muxPlaybackId: z.string().nullable().optional(),
  duration: z.number().int().nullable().optional(),
});

export const updateVideoSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived', 'disabled']).optional(),
  sortOrder: z.number().int().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  muxAssetId: z.string().nullable().optional(),
  muxPlaybackId: z.string().nullable().optional(),
  duration: z.number().int().nullable().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const courseIdParamSchema = z.object({
  courseId: z.string().uuid(),
});

export type CreateVideoBody = z.infer<typeof createVideoSchema>;
export type UpdateVideoBody = z.infer<typeof updateVideoSchema>;
