import type { Pool } from 'pg';
import type { ICourseRepo } from '../../../domain/course/repos/ICourseRepo.js';
import type { Course } from '../../../domain/course/Course.js';
import { CourseMapper, type CoursePersistence } from '../mappers/CourseMapper.js';

export class PgCourseRepo implements ICourseRepo {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Course | null> {
    const result = await this.pool.query<CoursePersistence>(
      'SELECT id, name, description, status, created_at, updated_at FROM courses WHERE id = $1',
      [id],
    );

    const row = result.rows[0];
    if (!row) return null;

    return CourseMapper.toDomain(row);
  }

  async findAll(): Promise<Course[]> {
    const result = await this.pool.query<CoursePersistence>(
      'SELECT id, name, description, status, created_at, updated_at FROM courses ORDER BY created_at DESC',
    );

    return result.rows.map((r) => CourseMapper.toDomain(r));
  }

  async save(course: Course): Promise<void> {
    const raw = CourseMapper.toPersistence(course);

    await this.pool.query(
      `INSERT INTO courses (id, name, description, status, created_at, updated_at)
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
    const result = await this.pool.query('DELETE FROM courses WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.pool.query('SELECT 1 FROM courses WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
