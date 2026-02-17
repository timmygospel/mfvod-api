import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { ICourseRepo } from '../../domain/course/repos/ICourseRepo.js';
import { CourseMapper, type CourseDTO } from '../../infrastructure/db/mappers/CourseMapper.js';

interface GetCourseByIdDTO {
  id: string;
}

export class GetCourseById implements UseCase<GetCourseByIdDTO, Result<CourseDTO>> {
  constructor(private readonly courseRepo: ICourseRepo) {}

  async execute(request: GetCourseByIdDTO): Promise<Result<CourseDTO>> {
    const course = await this.courseRepo.findById(request.id);

    if (!course) {
      return Result.fail(`Course with id "${request.id}" not found`);
    }

    return Result.ok(CourseMapper.toDTO(course));
  }
}
