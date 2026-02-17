import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import { Course } from '../../domain/course/Course.js';
import type { ICourseRepo } from '../../domain/course/repos/ICourseRepo.js';
import { CourseMapper, type CourseDTO } from '../../infrastructure/db/mappers/CourseMapper.js';

interface CreateCourseDTO {
  name: string;
  description?: string;
  status?: string;
}

export class CreateCourse implements UseCase<CreateCourseDTO, Result<CourseDTO>> {
  constructor(private readonly courseRepo: ICourseRepo) {}

  async execute(request: CreateCourseDTO): Promise<Result<CourseDTO>> {
    const courseResult = Course.create({
      name: request.name,
      description: request.description,
      status: request.status,
    });

    if (courseResult.isFailure) {
      return Result.fail(courseResult.errorValue);
    }

    const course = courseResult.value;
    await this.courseRepo.save(course);

    return Result.ok(CourseMapper.toDTO(course));
  }
}
