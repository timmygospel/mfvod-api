import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { ICourseRepo } from '../../domain/course/repos/ICourseRepo.js';
import { CourseMapper, type CourseDTO } from '../../infrastructure/db/mappers/CourseMapper.js';

interface UpdateCourseDTO {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}

export class UpdateCourse implements UseCase<UpdateCourseDTO, Result<CourseDTO>> {
  constructor(private readonly courseRepo: ICourseRepo) {}

  async execute(request: UpdateCourseDTO): Promise<Result<CourseDTO>> {
    const existing = await this.courseRepo.findById(request.id);

    if (!existing) {
      return Result.fail(`Course with id "${request.id}" not found`);
    }

    const updateResult = existing.update({
      name: request.name,
      description: request.description,
      status: request.status,
    });

    if (updateResult.isFailure) {
      return Result.fail(updateResult.errorValue);
    }

    const updated = updateResult.value;
    await this.courseRepo.save(updated);

    return Result.ok(CourseMapper.toDTO(updated));
  }
}
