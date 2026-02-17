import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import { Category } from '../../domain/category/Category.js';
import type { ICategoryRepo } from '../../domain/category/repos/ICategoryRepo.js';
import { CategoryMapper, type CategoryDTO } from '../../infrastructure/db/mappers/CategoryMapper.js';

interface CreateCategoryDTO {
  name: string;
  description?: string;
  status?: string;
}

export class CreateCategory implements UseCase<CreateCategoryDTO, Result<CategoryDTO>> {
  constructor(private readonly categoryRepo: ICategoryRepo) {}

  async execute(request: CreateCategoryDTO): Promise<Result<CategoryDTO>> {
    const categoryResult = Category.create({
      name: request.name,
      description: request.description,
      status: request.status,
    });

    if (categoryResult.isFailure) {
      return Result.fail(categoryResult.errorValue);
    }

    const category = categoryResult.value;
    await this.categoryRepo.save(category);

    return Result.ok(CategoryMapper.toDTO(category));
  }
}
