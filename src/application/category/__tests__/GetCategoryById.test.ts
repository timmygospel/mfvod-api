import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCategoryById } from '../GetCategoryById.js';
import { Category } from '../../../domain/category/Category.js';
import type { ICategoryRepo } from '../../../domain/category/repos/ICategoryRepo.js';

describe('GetCategoryById', () => {
  let mockRepo: ICategoryRepo;
  let useCase: GetCategoryById;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new GetCategoryById(mockRepo);
  });

  it('should return a category DTO when found', async () => {
    const category = Category.create({ name: 'Found Category', description: 'Desc' }).value;
    vi.mocked(mockRepo.findById).mockResolvedValue(category);

    const result = await useCase.execute({ id: category.id.toValue() });

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('Found Category');
    expect(result.value.id).toBe(category.id.toValue());
  });

  it('should fail when category not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute({ id: 'non-existent-id' });

    expect(result.isFailure).toBe(true);
  });
});
