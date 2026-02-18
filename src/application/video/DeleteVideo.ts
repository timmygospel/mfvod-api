import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { IVideoRepo } from '../../domain/video/repos/IVideoRepo.js';

interface DeleteVideoDTO {
  id: string;
}

export class DeleteVideo implements UseCase<DeleteVideoDTO, Result<void>> {
  constructor(private readonly videoRepo: IVideoRepo) {}

  async execute(request: DeleteVideoDTO): Promise<Result<void>> {
    const deleted = await this.videoRepo.delete(request.id);

    if (!deleted) {
      return Result.fail(`Video with id "${request.id}" not found`);
    }

    return Result.ok();
  }
}
