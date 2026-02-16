import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ALLOWLIST: z.string().default(''),
});

export type AppConfig = z.infer<typeof envSchema>;

function loadConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    throw new Error(`Invalid environment variables: ${JSON.stringify(formatted, null, 2)}`);
  }

  return parsed.data;
}

export const config = loadConfig();
