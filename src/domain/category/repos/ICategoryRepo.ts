import type { Category } from '../Category.js';

export interface ICategoryRepo {
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  save(category: Category): Promise<void>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
