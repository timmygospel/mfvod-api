import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createCategoryRouter } from '../categories.js';
import { Result } from '../../../../domain/shared/Result.js';
import { errorHandler } from '../../middleware/errorHandler.js';

vi.mock('../../../../infrastructure/config/index.js', () => ({
  config: {
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_URL: 'postgres://localhost:5432/test',
    LOG_LEVEL: 'silent',
    CORS_ALLOWLIST: '',
  },
}));

vi.mock('../../../../infrastructure/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
    level: 'silent',
  },
}));

function buildApp(useCases: Parameters<typeof createCategoryRouter>[0]) {
  const app = express();
  app.use(express.json());
  app.use('/categories', createCategoryRouter(useCases));
  app.use(errorHandler);
  return app;
}

const categoryDTO = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Category',
  description: 'A test category',
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('POST /categories', () => {
  it('should return 201 on success', async () => {
    const useCases = {
      createCategory: { execute: vi.fn().mockResolvedValue(Result.ok(categoryDTO)) },
      getCategoryById: { execute: vi.fn() },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn() },
      deleteCategory: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).post('/categories').send({ name: 'Test Category' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Category');
  });

  it('should return 400 on validation error', async () => {
    const useCases = {
      createCategory: { execute: vi.fn() },
      getCategoryById: { execute: vi.fn() },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn() },
      deleteCategory: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).post('/categories').send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when use case fails', async () => {
    const useCases = {
      createCategory: { execute: vi.fn().mockResolvedValue(Result.fail('Invalid name')) },
      getCategoryById: { execute: vi.fn() },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn() },
      deleteCategory: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).post('/categories').send({ name: 'abc' });

    expect(res.status).toBe(400);
  });
});

describe('GET /categories', () => {
  it('should return 200 with list of categories', async () => {
    const useCases = {
      createCategory: { execute: vi.fn() },
      getCategoryById: { execute: vi.fn() },
      listCategories: { execute: vi.fn().mockResolvedValue(Result.ok([categoryDTO])) },
      updateCategory: { execute: vi.fn() },
      deleteCategory: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).get('/categories');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('GET /categories/:id', () => {
  it('should return 200 when found', async () => {
    const useCases = {
      createCategory: { execute: vi.fn() },
      getCategoryById: { execute: vi.fn().mockResolvedValue(Result.ok(categoryDTO)) },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn() },
      deleteCategory: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).get(`/categories/${categoryDTO.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Category');
  });

  it('should return 404 when not found', async () => {
    const useCases = {
      createCategory: { execute: vi.fn() },
      getCategoryById: { execute: vi.fn().mockResolvedValue(Result.fail('not found')) },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn() },
      deleteCategory: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).get(`/categories/${categoryDTO.id}`);

    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid uuid', async () => {
    const useCases = {
      createCategory: { execute: vi.fn() },
      getCategoryById: { execute: vi.fn() },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn() },
      deleteCategory: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).get('/categories/not-a-uuid');

    expect(res.status).toBe(400);
  });
});

describe('PUT /categories/:id', () => {
  it('should return 200 on success', async () => {
    const updatedDTO = { ...categoryDTO, name: 'Updated' };
    const useCases = {
      createCategory: { execute: vi.fn() },
      getCategoryById: { execute: vi.fn() },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn().mockResolvedValue(Result.ok(updatedDTO)) },
      deleteCategory: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).put(`/categories/${categoryDTO.id}`).send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 when not found', async () => {
    const useCases = {
      createCategory: { execute: vi.fn() },
      getCategoryById: { execute: vi.fn() },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn().mockResolvedValue(Result.fail('not found')) },
      deleteCategory: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).put(`/categories/${categoryDTO.id}`).send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /categories/:id', () => {
  it('should return 204 on success', async () => {
    const useCases = {
      createCategory: { execute: vi.fn() },
      getCategoryById: { execute: vi.fn() },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn() },
      deleteCategory: { execute: vi.fn().mockResolvedValue(Result.ok()) },
    };
    const app = buildApp(useCases);

    const res = await request(app).delete(`/categories/${categoryDTO.id}`);

    expect(res.status).toBe(204);
  });

  it('should return 404 when not found', async () => {
    const useCases = {
      createCategory: { execute: vi.fn() },
      getCategoryById: { execute: vi.fn() },
      listCategories: { execute: vi.fn() },
      updateCategory: { execute: vi.fn() },
      deleteCategory: { execute: vi.fn().mockResolvedValue(Result.fail('not found')) },
    };
    const app = buildApp(useCases);

    const res = await request(app).delete(`/categories/${categoryDTO.id}`);

    expect(res.status).toBe(404);
  });
});
