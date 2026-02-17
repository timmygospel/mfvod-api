import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { ICategoryRepo } from '../../domain/category/repos/ICategoryRepo.js';

const UNASSIGNED_CATEGORY_ID = '00000000-0000-0000-0000-000000000000';

interface DeleteCategoryDTO {
  id: string;
}

export class DeleteCategory implements UseCase<DeleteCategoryDTO, Result<void>> {
  constructor(private readonly categoryRepo: ICategoryRepo) {}

  async execute(request: DeleteCategoryDTO): Promise<Result<void>> {
    if (request.id === UNASSIGNED_CATEGORY_ID) {
      return Result.fail('Cannot delete the default "Unassigned" category');
    }

    const deleted = await this.categoryRepo.delete(request.id);

    if (!deleted) {
      return Result.fail(`Category with id "${request.id}" not found`);
    }

    return Result.ok();
  }
}
