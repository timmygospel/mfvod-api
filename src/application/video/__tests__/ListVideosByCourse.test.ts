import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListVideosByCourse } from '../ListVideosByCourse.js';
import type { IVideoRepo } from '../../../domain/video/repos/IVideoRepo.js';
import { Video } from '../../../domain/video/Video.js';

describe('ListVideosByCourse', () => {
  let mockRepo: IVideoRepo;
  let useCase: ListVideosByCourse;
  const courseId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByCourseId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new ListVideosByCourse(mockRepo);
  });

  it('should return videos for a course', async () => {
    const video = Video.create({ title: 'Test Video', courseId }).value;
    vi.mocked(mockRepo.findByCourseId).mockResolvedValue([video]);

    const result = await useCase.execute({ courseId });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(1);
    expect(result.value[0].title).toBe('Test Video');
    expect(mockRepo.findByCourseId).toHaveBeenCalledWith(courseId);
  });

  it('should return empty array when no videos for course', async () => {
    vi.mocked(mockRepo.findByCourseId).mockResolvedValue([]);

    const result = await useCase.execute({ courseId });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });
});
