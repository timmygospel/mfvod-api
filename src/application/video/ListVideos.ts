import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { IVideoRepo } from '../../domain/video/repos/IVideoRepo.js';
import { VideoMapper, type VideoDTO } from '../../infrastructure/db/mappers/VideoMapper.js';

export class ListVideos implements UseCase<void, Result<VideoDTO[]>> {
  constructor(private readonly videoRepo: IVideoRepo) {}

  async execute(): Promise<Result<VideoDTO[]>> {
    const videos = await this.videoRepo.findAll();
    const dtos = videos.map((v) => VideoMapper.toDTO(v));
    return Result.ok(dtos);
  }
}
