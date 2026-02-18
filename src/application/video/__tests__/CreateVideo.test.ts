import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateVideo } from '../CreateVideo.js';
import type { IVideoRepo } from '../../../domain/video/repos/IVideoRepo.js';
import type { ICourseRepo } from '../../../domain/course/repos/ICourseRepo.js';

describe('CreateVideo', () => {
  let mockVideoRepo: IVideoRepo;
  let mockCourseRepo: ICourseRepo;
  let useCase: CreateVideo;
  const validCourseId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    mockVideoRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByCourseId: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    mockCourseRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn().mockResolvedValue(true),
    };
    useCase = new CreateVideo(mockVideoRepo, mockCourseRepo);
  });

  it('should create a video and call save', async () => {
    const result = await useCase.execute({
      title: 'DDD Video',
      description: 'Learn DDD',
      courseId: validCourseId,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.title).toBe('DDD Video');
    expect(result.value.description).toBe('Learn DDD');
    expect(result.value.status).toBe('active');
    expect(result.value.courseId).toBe(validCourseId);
    expect(result.value.id).toBeDefined();
    expect(mockVideoRepo.save).toHaveBeenCalledOnce();
  });

  it('should fail with invalid title', async () => {
    const result = await useCase.execute({ title: '', courseId: validCourseId });

    expect(result.isFailure).toBe(true);
    expect(mockVideoRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when course does not exist', async () => {
    vi.mocked(mockCourseRepo.exists).mockResolvedValue(false);

    const result = await useCase.execute({ title: 'Valid Title', courseId: validCourseId });

    expect(result.isFailure).toBe(true);
    expect(result.errorValue).toContain('Course');
    expect(mockVideoRepo.save).not.toHaveBeenCalled();
  });

  it('should create a video with sortOrder', async () => {
    const result = await useCase.execute({
      title: 'DDD Video',
      courseId: validCourseId,
      sortOrder: 5,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.sortOrder).toBe(5);
  });
});
