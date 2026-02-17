import type { Course } from '../Course.js';

export interface ICourseRepo {
  findById(id: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  save(course: Course): Promise<void>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
