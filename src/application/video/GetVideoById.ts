import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { IVideoRepo } from '../../domain/video/repos/IVideoRepo.js';
import { VideoMapper, type VideoDTO } from '../../infrastructure/db/mappers/VideoMapper.js';

interface GetVideoByIdDTO {
  id: string;
}

export class GetVideoById implements UseCase<GetVideoByIdDTO, Result<VideoDTO>> {
  constructor(private readonly videoRepo: IVideoRepo) {}

  async execute(request: GetVideoByIdDTO): Promise<Result<VideoDTO>> {
    const video = await this.videoRepo.findById(request.id);

    if (!video) {
      return Result.fail(`Video with id "${request.id}" not found`);
    }

    return Result.ok(VideoMapper.toDTO(video));
  }
}
