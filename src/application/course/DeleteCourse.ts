import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { ICourseRepo } from '../../domain/course/repos/ICourseRepo.js';

interface DeleteCourseDTO {
  id: string;
}

export class DeleteCourse implements UseCase<DeleteCourseDTO, Result<void>> {
  constructor(private readonly courseRepo: ICourseRepo) {}

  async execute(request: DeleteCourseDTO): Promise<Result<void>> {
    const deleted = await this.courseRepo.delete(request.id);

    if (!deleted) {
      return Result.fail(`Course with id "${request.id}" not found`);
    }

    return Result.ok();
  }
}
