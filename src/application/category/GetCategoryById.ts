import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { ICategoryRepo } from '../../domain/category/repos/ICategoryRepo.js';
import { CategoryMapper, type CategoryDTO } from '../../infrastructure/db/mappers/CategoryMapper.js';

interface GetCategoryByIdDTO {
  id: string;
}

export class GetCategoryById implements UseCase<GetCategoryByIdDTO, Result<CategoryDTO>> {
  constructor(private readonly categoryRepo: ICategoryRepo) {}

  async execute(request: GetCategoryByIdDTO): Promise<Result<CategoryDTO>> {
    const category = await this.categoryRepo.findById(request.id);

    if (!category) {
      return Result.fail(`Category with id "${request.id}" not found`);
    }

    return Result.ok(CategoryMapper.toDTO(category));
  }
}
