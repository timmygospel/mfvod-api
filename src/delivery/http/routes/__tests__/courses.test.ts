import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createCourseRouter } from '../courses.js';
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

function buildApp(useCases: Parameters<typeof createCourseRouter>[0]) {
  const app = express();
  app.use(express.json());
  app.use('/courses', createCourseRouter(useCases));
  app.use(errorHandler);
  return app;
}

const courseDTO = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Course',
  description: 'A test course',
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('POST /courses', () => {
  it('should return 201 on success', async () => {
    const useCases = {
      createCourse: { execute: vi.fn().mockResolvedValue(Result.ok(courseDTO)) },
      getCourseById: { execute: vi.fn() },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn() },
      deleteCourse: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).post('/courses').send({ name: 'Test Course' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Course');
  });

  it('should return 400 on validation error', async () => {
    const useCases = {
      createCourse: { execute: vi.fn() },
      getCourseById: { execute: vi.fn() },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn() },
      deleteCourse: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).post('/courses').send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when use case fails', async () => {
    const useCases = {
      createCourse: { execute: vi.fn().mockResolvedValue(Result.fail('Invalid name')) },
      getCourseById: { execute: vi.fn() },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn() },
      deleteCourse: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).post('/courses').send({ name: 'abc' });

    expect(res.status).toBe(400);
  });
});

describe('GET /courses', () => {
  it('should return 200 with list of courses', async () => {
    const useCases = {
      createCourse: { execute: vi.fn() },
      getCourseById: { execute: vi.fn() },
      listCourses: { execute: vi.fn().mockResolvedValue(Result.ok([courseDTO])) },
      updateCourse: { execute: vi.fn() },
      deleteCourse: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).get('/courses');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('GET /courses/:id', () => {
  it('should return 200 when found', async () => {
    const useCases = {
      createCourse: { execute: vi.fn() },
      getCourseById: { execute: vi.fn().mockResolvedValue(Result.ok(courseDTO)) },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn() },
      deleteCourse: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).get(`/courses/${courseDTO.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Course');
  });

  it('should return 404 when not found', async () => {
    const useCases = {
      createCourse: { execute: vi.fn() },
      getCourseById: { execute: vi.fn().mockResolvedValue(Result.fail('not found')) },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn() },
      deleteCourse: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).get(`/courses/${courseDTO.id}`);

    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid uuid', async () => {
    const useCases = {
      createCourse: { execute: vi.fn() },
      getCourseById: { execute: vi.fn() },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn() },
      deleteCourse: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).get('/courses/not-a-uuid');

    expect(res.status).toBe(400);
  });
});

describe('PUT /courses/:id', () => {
  it('should return 200 on success', async () => {
    const updatedDTO = { ...courseDTO, name: 'Updated' };
    const useCases = {
      createCourse: { execute: vi.fn() },
      getCourseById: { execute: vi.fn() },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn().mockResolvedValue(Result.ok(updatedDTO)) },
      deleteCourse: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).put(`/courses/${courseDTO.id}`).send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 when not found', async () => {
    const useCases = {
      createCourse: { execute: vi.fn() },
      getCourseById: { execute: vi.fn() },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn().mockResolvedValue(Result.fail('not found')) },
      deleteCourse: { execute: vi.fn() },
    };
    const app = buildApp(useCases);

    const res = await request(app).put(`/courses/${courseDTO.id}`).send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /courses/:id', () => {
  it('should return 204 on success', async () => {
    const useCases = {
      createCourse: { execute: vi.fn() },
      getCourseById: { execute: vi.fn() },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn() },
      deleteCourse: { execute: vi.fn().mockResolvedValue(Result.ok()) },
    };
    const app = buildApp(useCases);

    const res = await request(app).delete(`/courses/${courseDTO.id}`);

    expect(res.status).toBe(204);
  });

  it('should return 404 when not found', async () => {
    const useCases = {
      createCourse: { execute: vi.fn() },
      getCourseById: { execute: vi.fn() },
      listCourses: { execute: vi.fn() },
      updateCourse: { execute: vi.fn() },
      deleteCourse: { execute: vi.fn().mockResolvedValue(Result.fail('not found')) },
    };
    const app = buildApp(useCases);

    const res = await request(app).delete(`/courses/${courseDTO.id}`);

    expect(res.status).toBe(404);
  });
});
