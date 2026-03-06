import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
