import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteCategory } from '../DeleteCategory.js';
import type { ICategoryRepo } from '../../../domain/category/repos/ICategoryRepo.js';

const UNASSIGNED_CATEGORY_ID = '00000000-0000-0000-0000-000000000000';

describe('DeleteCategory', () => {
  let mockRepo: ICategoryRepo;
  let useCase: DeleteCategory;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new DeleteCategory(mockRepo);
  });

  it('should delete a category successfully', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue(true);

    const result = await useCase.execute({ id: 'some-id' });

    expect(result.isSuccess).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith('some-id');
  });

  it('should fail when category not found', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue(false);

    const result = await useCase.execute({ id: 'non-existent' });

    expect(result.isFailure).toBe(true);
  });

  it('should prevent deletion of the Unassigned default category', async () => {
    const result = await useCase.execute({ id: UNASSIGNED_CATEGORY_ID });

    expect(result.isFailure).toBe(true);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
