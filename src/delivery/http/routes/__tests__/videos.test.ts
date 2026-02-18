import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createVideoRouter } from '../videos.js';
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

function buildApp(useCases: Parameters<typeof createVideoRouter>[0]) {
  const app = express();
  app.use(express.json());
  app.use('/videos', createVideoRouter(useCases));
  app.use(errorHandler);
  return app;
}

const videoDTO = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Test Video',
  description: 'A test video',
  status: 'active' as const,
  courseId: '660e8400-e29b-41d4-a716-446655440000',
  sortOrder: 0,
  thumbnailUrl: null,
  muxAssetId: null,
  muxPlaybackId: null,
  duration: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const defaultUseCases = () => ({
  createVideo: { execute: vi.fn() },
  getVideoById: { execute: vi.fn() },
  listVideos: { execute: vi.fn() },
  updateVideo: { execute: vi.fn() },
  deleteVideo: { execute: vi.fn() },
  listVideosByCourse: { execute: vi.fn() },
});

describe('POST /videos', () => {
  it('should return 201 on success', async () => {
    const useCases = defaultUseCases();
    useCases.createVideo.execute.mockResolvedValue(Result.ok(videoDTO));
    const app = buildApp(useCases);

    const res = await request(app)
      .post('/videos')
      .send({ title: 'Test Video', courseId: videoDTO.courseId });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test Video');
  });

  it('should return 400 on validation error', async () => {
    const useCases = defaultUseCases();
    const app = buildApp(useCases);

    const res = await request(app).post('/videos').send({ title: '' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when use case fails', async () => {
    const useCases = defaultUseCases();
    useCases.createVideo.execute.mockResolvedValue(Result.fail('Course not found'));
    const app = buildApp(useCases);

    const res = await request(app)
      .post('/videos')
      .send({ title: 'abc', courseId: videoDTO.courseId });

    expect(res.status).toBe(400);
  });
});

describe('GET /videos', () => {
  it('should return 200 with list of videos', async () => {
    const useCases = defaultUseCases();
    useCases.listVideos.execute.mockResolvedValue(Result.ok([videoDTO]));
    const app = buildApp(useCases);

    const res = await request(app).get('/videos');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('GET /videos/:id', () => {
  it('should return 200 when found', async () => {
    const useCases = defaultUseCases();
    useCases.getVideoById.execute.mockResolvedValue(Result.ok(videoDTO));
    const app = buildApp(useCases);

    const res = await request(app).get(`/videos/${videoDTO.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Test Video');
  });

  it('should return 404 when not found', async () => {
    const useCases = defaultUseCases();
    useCases.getVideoById.execute.mockResolvedValue(Result.fail('not found'));
    const app = buildApp(useCases);

    const res = await request(app).get(`/videos/${videoDTO.id}`);

    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid uuid', async () => {
    const useCases = defaultUseCases();
    const app = buildApp(useCases);

    const res = await request(app).get('/videos/not-a-uuid');

    expect(res.status).toBe(400);
  });
});

describe('PUT /videos/:id', () => {
  it('should return 200 on success', async () => {
    const updatedDTO = { ...videoDTO, title: 'Updated' };
    const useCases = defaultUseCases();
    useCases.updateVideo.execute.mockResolvedValue(Result.ok(updatedDTO));
    const app = buildApp(useCases);

    const res = await request(app).put(`/videos/${videoDTO.id}`).send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated');
  });

  it('should return 404 when not found', async () => {
    const useCases = defaultUseCases();
    useCases.updateVideo.execute.mockResolvedValue(Result.fail('not found'));
    const app = buildApp(useCases);

    const res = await request(app).put(`/videos/${videoDTO.id}`).send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /videos/:id', () => {
  it('should return 204 on success', async () => {
    const useCases = defaultUseCases();
    useCases.deleteVideo.execute.mockResolvedValue(Result.ok());
    const app = buildApp(useCases);

    const res = await request(app).delete(`/videos/${videoDTO.id}`);

    expect(res.status).toBe(204);
  });

  it('should return 404 when not found', async () => {
    const useCases = defaultUseCases();
    useCases.deleteVideo.execute.mockResolvedValue(Result.fail('not found'));
    const app = buildApp(useCases);

    const res = await request(app).delete(`/videos/${videoDTO.id}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /videos/course/:courseId', () => {
  it('should return 200 with videos for course', async () => {
    const useCases = defaultUseCases();
    useCases.listVideosByCourse.execute.mockResolvedValue(Result.ok([videoDTO]));
    const app = buildApp(useCases);

    const res = await request(app).get(`/videos/course/${videoDTO.courseId}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 400 for invalid courseId', async () => {
    const useCases = defaultUseCases();
    const app = buildApp(useCases);

    const res = await request(app).get('/videos/course/not-a-uuid');

    expect(res.status).toBe(400);
  });
});
