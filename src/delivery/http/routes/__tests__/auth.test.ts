import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../../../../infrastructure/config/index.js', () => ({
  config: {
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_URL: 'postgres://localhost:5432/test',
    LOG_LEVEL: 'silent',
    CORS_ALLOWLIST: '',
    JWT_ACCESS_SECRET: 'test-access-secret-32-chars-min!!',
    JWT_REFRESH_SECRET: 'test-refresh-secret-32-chars-min!',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

vi.mock('../../../../infrastructure/logger/index.js', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { createAuthRouter } from '../auth.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import type { RegisterUser } from '../../../../application/user/RegisterUser.js';
import type { LoginUser } from '../../../../application/user/LoginUser.js';
import type { SetupTwoFactor } from '../../../../application/user/SetupTwoFactor.js';
import type { VerifyTwoFactor } from '../../../../application/user/VerifyTwoFactor.js';
import type { RefreshToken } from '../../../../application/user/RefreshToken.js';
import { Result } from '../../../../domain/shared/Result.js';

// Mock jwt so the tests don't need real secrets configured
vi.mock('../../../../infrastructure/auth/jwt.js', () => ({
  signAccessToken: () => 'access.mock',
  signRefreshToken: () => 'refresh.mock',
  verifyAccessToken: (token: string) => {
    if (token === 'access.mock') return { sub: 'user-123', email: 'u@example.com', role: 'subscriber' };
    throw new Error('invalid');
  },
  verifyRefreshToken: (token: string) => {
    if (token === 'refresh.mock') return { sub: 'user-123' };
    throw new Error('invalid');
  },
}));

const mockUserDTO = {
  id: 'user-123',
  email: 'user@example.com',
  role: 'subscriber' as const,
  twoFactorEnabled: false,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function makeApp(overrides: Partial<{
  registerUser: Pick<RegisterUser, 'execute'>;
  loginUser: Pick<LoginUser, 'execute'>;
  setupTwoFactor: Pick<SetupTwoFactor, 'execute'>;
  verifyTwoFactor: Pick<VerifyTwoFactor, 'execute'>;
  refreshToken: Pick<RefreshToken, 'execute'>;
}> = {}) {
  const defaults = {
    registerUser: { execute: async () => Result.ok({ user: mockUserDTO, accessToken: 'access.mock', refreshToken: 'refresh.mock' }) },
    loginUser: { execute: async () => Result.ok({ user: mockUserDTO, requiresTwoFactor: false, accessToken: 'access.mock', refreshToken: 'refresh.mock' }) },
    setupTwoFactor: { execute: async () => Result.ok({ secret: 'SECRET', qrCodeUri: 'otpauth://totp/test' }) },
    verifyTwoFactor: { execute: async () => Result.ok({ user: mockUserDTO, accessToken: 'access.mock', refreshToken: 'refresh.mock' }) },
    refreshToken: { execute: async () => Result.ok({ accessToken: 'access.mock', refreshToken: 'refresh.mock' }) },
  };

  const useCases = { ...defaults, ...overrides } as Parameters<typeof createAuthRouter>[0];
  const app = express();
  app.use(express.json());
  app.use('/auth', createAuthRouter(useCases));
  app.use(errorHandler);
  return app;
}

describe('POST /auth/register', () => {
  it('should return 201 with tokens on success', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'StrongPass1!' });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBe('access.mock');
  });

  it('should return 400 with invalid email', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'bad', password: 'StrongPass1!' });
    expect(res.status).toBe(400);
  });

  it('should return 400 when use case fails', async () => {
    const app = makeApp({
      registerUser: { execute: async () => Result.fail('Email is already registered.') },
    });
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'StrongPass1!' });
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('should return 200 with tokens', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'StrongPass1!' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe('access.mock');
  });

  it('should return 200 with requiresTwoFactor', async () => {
    const app = makeApp({
      loginUser: { execute: async () => Result.ok({ user: mockUserDTO, requiresTwoFactor: true, preAuthToken: 'access.mock' }) },
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'pass' });
    expect(res.status).toBe(200);
    expect(res.body.data.requiresTwoFactor).toBe(true);
  });

  it('should return 401 when credentials invalid', async () => {
    const app = makeApp({
      loginUser: { execute: async () => Result.fail('Invalid email or password.') },
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/2fa/setup', () => {
  it('should return 200 with secret and qrCodeUri when authenticated', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/auth/2fa/setup')
      .set('Authorization', 'Bearer access.mock');
    expect(res.status).toBe(200);
    expect(res.body.data.secret).toBe('SECRET');
    expect(res.body.data.qrCodeUri).toContain('otpauth://');
  });

  it('should return 401 without token', async () => {
    const app = makeApp();
    const res = await request(app).post('/auth/2fa/setup');
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/2fa/verify', () => {
  it('should return 200 with tokens on valid code', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/auth/2fa/verify')
      .set('Authorization', 'Bearer access.mock')
      .send({ code: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe('access.mock');
  });

  it('should return 400 for non-6-digit code', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/auth/2fa/verify')
      .set('Authorization', 'Bearer access.mock')
      .send({ code: '12' });
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/refresh', () => {
  it('should return 200 with new tokens', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'refresh.mock' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe('access.mock');
  });

  it('should return 401 when use case fails', async () => {
    const app = makeApp({
      refreshToken: { execute: async () => Result.fail('Invalid or expired refresh token.') },
    });
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'bad.token' });
    expect(res.status).toBe(401);
  });
});
