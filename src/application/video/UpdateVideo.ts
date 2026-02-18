import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { IVideoRepo } from '../../domain/video/repos/IVideoRepo.js';
import { VideoMapper, type VideoDTO } from '../../infrastructure/db/mappers/VideoMapper.js';

interface UpdateVideoDTO {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  sortOrder?: number;
  thumbnailUrl?: string | null;
  muxAssetId?: string | null;
  muxPlaybackId?: string | null;
  duration?: number | null;
}

export class UpdateVideo implements UseCase<UpdateVideoDTO, Result<VideoDTO>> {
  constructor(private readonly videoRepo: IVideoRepo) {}

  async execute(request: UpdateVideoDTO): Promise<Result<VideoDTO>> {
    const existing = await this.videoRepo.findById(request.id);

    if (!existing) {
      return Result.fail(`Video with id "${request.id}" not found`);
    }

    const updateResult = existing.update({
      title: request.title,
      description: request.description,
      status: request.status,
      sortOrder: request.sortOrder,
      thumbnailUrl: request.thumbnailUrl,
      muxAssetId: request.muxAssetId,
      muxPlaybackId: request.muxPlaybackId,
      duration: request.duration,
    });

    if (updateResult.isFailure) {
      return Result.fail(updateResult.errorValue);
    }

    const updated = updateResult.value;
    await this.videoRepo.save(updated);

    return Result.ok(VideoMapper.toDTO(updated));
  }
}
