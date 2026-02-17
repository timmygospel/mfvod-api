import type { Pool } from 'pg';
import type { ICategoryRepo } from '../../../domain/category/repos/ICategoryRepo.js';
import type { Category } from '../../../domain/category/Category.js';
import { CategoryMapper, type CategoryPersistence } from '../mappers/CategoryMapper.js';

export class PgCategoryRepo implements ICategoryRepo {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Category | null> {
    const result = await this.pool.query<CategoryPersistence>(
      'SELECT id, name, description, status, created_at, updated_at FROM categories WHERE id = $1',
      [id],
    );

    const row = result.rows[0];
    if (!row) return null;

    return CategoryMapper.toDomain(row);
  }

  async findByName(name: string): Promise<Category | null> {
    const result = await this.pool.query<CategoryPersistence>(
      'SELECT id, name, description, status, created_at, updated_at FROM categories WHERE name = $1',
      [name],
    );

    const row = result.rows[0];
    if (!row) return null;

    return CategoryMapper.toDomain(row);
  }

  async findAll(): Promise<Category[]> {
    const result = await this.pool.query<CategoryPersistence>(
      'SELECT id, name, description, status, created_at, updated_at FROM categories ORDER BY created_at DESC',
    );

    return result.rows.map((r) => CategoryMapper.toDomain(r));
  }

  async save(category: Category): Promise<void> {
    const raw = CategoryMapper.toPersistence(category);

    await this.pool.query(
      `INSERT INTO categories (id, name, description, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         status = EXCLUDED.status,
         updated_at = EXCLUDED.updated_at`,
      [raw.id, raw.name, raw.description, raw.status, raw.created_at, raw.updated_at],
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.pool.query('SELECT 1 FROM categories WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
