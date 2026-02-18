import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListVideos } from '../ListVideos.js';
import type { IVideoRepo } from '../../../domain/video/repos/IVideoRepo.js';
import { Video } from '../../../domain/video/Video.js';

describe('ListVideos', () => {
  let mockRepo: IVideoRepo;
  let useCase: ListVideos;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByCourseId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new ListVideos(mockRepo);
  });

  it('should return all videos', async () => {
    const video = Video.create({
      title: 'Test Video',
      courseId: '550e8400-e29b-41d4-a716-446655440000',
    }).value;
    vi.mocked(mockRepo.findAll).mockResolvedValue([video]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(1);
    expect(result.value[0].title).toBe('Test Video');
  });

  it('should return empty array when no videos', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });
});
