import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCourse } from '../UpdateCourse.js';
import { Course } from '../../../domain/course/Course.js';
import type { ICourseRepo } from '../../../domain/course/repos/ICourseRepo.js';

describe('UpdateCourse', () => {
  let mockRepo: ICourseRepo;
  let useCase: UpdateCourse;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new UpdateCourse(mockRepo);
  });

  it('should update a course successfully', async () => {
    const course = Course.create({ name: 'Original' }).value;
    vi.mocked(mockRepo.findById).mockResolvedValue(course);

    const result = await useCase.execute({
      id: course.id.toValue(),
      name: 'Updated',
      status: 'archived',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('Updated');
    expect(result.value.status).toBe('archived');
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('should fail when course not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute({ id: 'non-existent', name: 'Updated' });

    expect(result.isFailure).toBe(true);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should fail with invalid update data', async () => {
    const course = Course.create({ name: 'Original' }).value;
    vi.mocked(mockRepo.findById).mockResolvedValue(course);

    const result = await useCase.execute({ id: course.id.toValue(), name: '' });

    expect(result.isFailure).toBe(true);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
