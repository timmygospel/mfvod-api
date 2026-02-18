import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import type { IVideoRepo } from '../../domain/video/repos/IVideoRepo.js';
import { VideoMapper, type VideoDTO } from '../../infrastructure/db/mappers/VideoMapper.js';

interface ListVideosByCourseDTO {
  courseId: string;
}

export class ListVideosByCourse implements UseCase<ListVideosByCourseDTO, Result<VideoDTO[]>> {
  constructor(private readonly videoRepo: IVideoRepo) {}

  async execute(request: ListVideosByCourseDTO): Promise<Result<VideoDTO[]>> {
    const videos = await this.videoRepo.findByCourseId(request.courseId);
    const dtos = videos.map((v) => VideoMapper.toDTO(v));
    return Result.ok(dtos);
  }
}
