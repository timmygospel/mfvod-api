import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetVideoById } from '../GetVideoById.js';
import type { IVideoRepo } from '../../../domain/video/repos/IVideoRepo.js';
import { Video } from '../../../domain/video/Video.js';

describe('GetVideoById', () => {
  let mockRepo: IVideoRepo;
  let useCase: GetVideoById;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByCourseId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new GetVideoById(mockRepo);
  });

  it('should return a video when found', async () => {
    const video = Video.create({
      title: 'Test Video',
      courseId: '550e8400-e29b-41d4-a716-446655440000',
    }).value;
    vi.mocked(mockRepo.findById).mockResolvedValue(video);

    const result = await useCase.execute({ id: video.id.toValue() });

    expect(result.isSuccess).toBe(true);
    expect(result.value.title).toBe('Test Video');
  });

  it('should fail when video not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute({ id: '550e8400-e29b-41d4-a716-446655440000' });

    expect(result.isFailure).toBe(true);
  });
});
