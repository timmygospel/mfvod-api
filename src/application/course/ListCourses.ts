import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { ICourseRepo } from '../../domain/course/repos/ICourseRepo.js';
import { CourseMapper, type CourseDTO } from '../../infrastructure/db/mappers/CourseMapper.js';

export class ListCourses implements UseCase<void, Result<CourseDTO[]>> {
  constructor(private readonly courseRepo: ICourseRepo) {}

  async execute(): Promise<Result<CourseDTO[]>> {
    const courses = await this.courseRepo.findAll();
    const dtos = courses.map((c) => CourseMapper.toDTO(c));
    return Result.ok(dtos);
  }
}
