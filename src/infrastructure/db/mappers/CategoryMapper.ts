import { Category } from '../../../domain/category/Category.js';
import { UniqueEntityID } from '../../../domain/shared/UniqueEntityID.js';

export interface CategoryPersistence {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export class CategoryMapper {
  static toDomain(raw: CategoryPersistence): Category {
    return Category.reconstitute(
      {
        name: raw.name,
        description: raw.description,
        status: raw.status,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(category: Category): CategoryPersistence {
    return {
      id: category.id.toValue(),
      name: category.name.value,
      description: category.description.value,
      status: category.status.value,
      created_at: category.createdAt,
      updated_at: category.updatedAt,
    };
  }

  static toDTO(category: Category): CategoryDTO {
    return {
      id: category.id.toValue(),
      name: category.name.value,
      description: category.description.value,
      status: category.status.value,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}
