import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListCategories } from '../ListCategories.js';
import { Category } from '../../../domain/category/Category.js';
import type { ICategoryRepo } from '../../../domain/category/repos/ICategoryRepo.js';

describe('ListCategories', () => {
  let mockRepo: ICategoryRepo;
  let useCase: ListCategories;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new ListCategories(mockRepo);
  });

  it('should return a list of category DTOs', async () => {
    const cat1 = Category.create({ name: 'Category One' }).value;
    const cat2 = Category.create({ name: 'Category Two' }).value;
    vi.mocked(mockRepo.findAll).mockResolvedValue([cat1, cat2]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(2);
    expect(result.value[0]!.name).toBe('Category One');
    expect(result.value[1]!.name).toBe('Category Two');
  });

  it('should return empty list when no categories', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(0);
  });
});
