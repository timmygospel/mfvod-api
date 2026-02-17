import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCourse } from '../CreateCourse.js';
import type { ICourseRepo } from '../../../domain/course/repos/ICourseRepo.js';

describe('CreateCourse', () => {
  let mockRepo: ICourseRepo;
  let useCase: CreateCourse;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new CreateCourse(mockRepo);
  });

  it('should create a course and call save', async () => {
    const result = await useCase.execute({ name: 'DDD Course', description: 'Learn DDD' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('DDD Course');
    expect(result.value.description).toBe('Learn DDD');
    expect(result.value.status).toBe('active');
    expect(result.value.id).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('should fail with invalid name', async () => {
    const result = await useCase.execute({ name: '' });

    expect(result.isFailure).toBe(true);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
