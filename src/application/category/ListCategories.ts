import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { ICategoryRepo } from '../../domain/category/repos/ICategoryRepo.js';
import { CategoryMapper, type CategoryDTO } from '../../infrastructure/db/mappers/CategoryMapper.js';

export class ListCategories implements UseCase<void, Result<CategoryDTO[]>> {
  constructor(private readonly categoryRepo: ICategoryRepo) {}

  async execute(): Promise<Result<CategoryDTO[]>> {
    const categories = await this.categoryRepo.findAll();
    const dtos = categories.map((c) => CategoryMapper.toDTO(c));
    return Result.ok(dtos);
  }
}
