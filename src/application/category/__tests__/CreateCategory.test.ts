import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCategory } from '../CreateCategory.js';
import type { ICategoryRepo } from '../../../domain/category/repos/ICategoryRepo.js';

describe('CreateCategory', () => {
  let mockRepo: ICategoryRepo;
  let useCase: CreateCategory;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new CreateCategory(mockRepo);
  });

  it('should create a category and call save', async () => {
    const result = await useCase.execute({ name: 'Web Development', description: 'Web courses' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('Web Development');
    expect(result.value.description).toBe('Web courses');
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
