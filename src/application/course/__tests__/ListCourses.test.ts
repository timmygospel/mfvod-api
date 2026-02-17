import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListCourses } from '../ListCourses.js';
import { Course } from '../../../domain/course/Course.js';
import type { ICourseRepo } from '../../../domain/course/repos/ICourseRepo.js';

describe('ListCourses', () => {
  let mockRepo: ICourseRepo;
  let useCase: ListCourses;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new ListCourses(mockRepo);
  });

  it('should return a list of course DTOs', async () => {
    const course1 = Course.create({ name: 'Course One' }).value;
    const course2 = Course.create({ name: 'Course Two' }).value;
    vi.mocked(mockRepo.findAll).mockResolvedValue([course1, course2]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(2);
    expect(result.value[0]!.name).toBe('Course One');
    expect(result.value[1]!.name).toBe('Course Two');
  });

  it('should return empty list when no courses', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });
});
