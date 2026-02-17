import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCourseById } from '../GetCourseById.js';
import { Course } from '../../../domain/course/Course.js';
import type { ICourseRepo } from '../../../domain/course/repos/ICourseRepo.js';

describe('GetCourseById', () => {
  let mockRepo: ICourseRepo;
  let useCase: GetCourseById;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new GetCourseById(mockRepo);
  });

  it('should return a course DTO when found', async () => {
    const course = Course.create({ name: 'Found Course', description: 'Desc' }).value;
    vi.mocked(mockRepo.findById).mockResolvedValue(course);

    const result = await useCase.execute({ id: course.id.toValue() });

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('Found Course');
    expect(result.value.id).toBe(course.id.toValue());
  });

  it('should fail when course not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute({ id: 'non-existent-id' });

    expect(result.isFailure).toBe(true);
  });
});
