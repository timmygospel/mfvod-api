import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteCourse } from '../DeleteCourse.js';
import type { ICourseRepo } from '../../../domain/course/repos/ICourseRepo.js';

describe('DeleteCourse', () => {
  let mockRepo: ICourseRepo;
  let useCase: DeleteCourse;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new DeleteCourse(mockRepo);
  });

  it('should delete a course successfully', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue(true);

    const result = await useCase.execute({ id: 'some-id' });

    expect(result.isSuccess).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith('some-id');
  });

  it('should fail when course not found', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue(false);

    const result = await useCase.execute({ id: 'non-existent' });

    expect(result.isFailure).toBe(true);
  });
});
