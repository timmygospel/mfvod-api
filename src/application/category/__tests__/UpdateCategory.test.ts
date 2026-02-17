import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCategory } from '../UpdateCategory.js';
import { Category } from '../../../domain/category/Category.js';
import type { ICategoryRepo } from '../../../domain/category/repos/ICategoryRepo.js';

describe('UpdateCategory', () => {
  let mockRepo: ICategoryRepo;
  let useCase: UpdateCategory;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new UpdateCategory(mockRepo);
  });

  it('should update a category successfully', async () => {
    const category = Category.create({ name: 'Original' }).value;
    vi.mocked(mockRepo.findById).mockResolvedValue(category);

    const result = await useCase.execute({
      id: category.id.toValue(),
      name: 'Updated',
      status: 'archived',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('Updated');
    expect(result.value.status).toBe('archived');
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('should fail when category not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute({ id: 'non-existent', name: 'Updated' });

    expect(result.isFailure).toBe(true);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should fail with invalid update data', async () => {
    const category = Category.create({ name: 'Original' }).value;
    vi.mocked(mockRepo.findById).mockResolvedValue(category);

    const result = await useCase.execute({ id: category.id.toValue(), name: '' });

    expect(result.isFailure).toBe(true);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
