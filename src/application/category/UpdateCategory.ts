import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { ICategoryRepo } from '../../domain/category/repos/ICategoryRepo.js';
import { CategoryMapper, type CategoryDTO } from '../../infrastructure/db/mappers/CategoryMapper.js';

interface UpdateCategoryDTO {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}

export class UpdateCategory implements UseCase<UpdateCategoryDTO, Result<CategoryDTO>> {
  constructor(private readonly categoryRepo: ICategoryRepo) {}

  async execute(request: UpdateCategoryDTO): Promise<Result<CategoryDTO>> {
    const existing = await this.categoryRepo.findById(request.id);

    if (!existing) {
      return Result.fail(`Category with id "${request.id}" not found`);
    }

    const updateResult = existing.update({
      name: request.name,
      description: request.description,
      status: request.status,
    });

    if (updateResult.isFailure) {
      return Result.fail(updateResult.errorValue);
    }

    const updated = updateResult.value;
    await this.categoryRepo.save(updated);

    return Result.ok(CategoryMapper.toDTO(updated));
  }
}
