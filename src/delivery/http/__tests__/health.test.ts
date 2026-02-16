import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import request from 'supertest';

vi.mock('../../../infrastructure/config/index.js', () => ({
  config: {
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_URL: 'postgres://localhost:5432/test',
    LOG_LEVEL: 'silent',
    CORS_ALLOWLIST: '',
  },
}));

vi.mock('../../../infrastructure/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
    level: 'silent',
  },
}));

vi.mock('pino-http', () => ({
  pinoHttp: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

vi.mock('../../../infrastructure/db/pool.js', () => ({
  pool: {
    query: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
    end: vi.fn().mockResolvedValue(undefined),
  },
}));

let app: import('express').Express;

beforeEach(async () => {
  const { createApp } = await import('../app.js');
  app = createApp();
});

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /ready', () => {
  it('should return 200 with status ready when DB is connected', async () => {
    const response = await request(app).get('/ready');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ready' });
  });
});
