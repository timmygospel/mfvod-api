import type { UseCase } from '../shared/UseCase.js';
import { Result } from '../../domain/shared/Result.js';
import { Video } from '../../domain/video/Video.js';
import type { IVideoRepo } from '../../domain/video/repos/IVideoRepo.js';
import type { ICourseRepo } from '../../domain/course/repos/ICourseRepo.js';
import { VideoMapper, type VideoDTO } from '../../infrastructure/db/mappers/VideoMapper.js';

interface CreateVideoDTO {
  title: string;
  description?: string;
  status?: string;
  courseId: string;
  sortOrder?: number;
  thumbnailUrl?: string | null;
  muxAssetId?: string | null;
  muxPlaybackId?: string | null;
  duration?: number | null;
}

export class CreateVideo implements UseCase<CreateVideoDTO, Result<VideoDTO>> {
  constructor(
    private readonly videoRepo: IVideoRepo,
    private readonly courseRepo: ICourseRepo,
  ) {}

  async execute(request: CreateVideoDTO): Promise<Result<VideoDTO>> {
    const courseExists = await this.courseRepo.exists(request.courseId);
    if (!courseExists) {
      return Result.fail(`Course with id "${request.courseId}" not found`);
    }

    const videoResult = Video.create({
      title: request.title,
      description: request.description,
      status: request.status,
      courseId: request.courseId,
      sortOrder: request.sortOrder,
      thumbnailUrl: request.thumbnailUrl,
      muxAssetId: request.muxAssetId,
      muxPlaybackId: request.muxPlaybackId,
      duration: request.duration,
    });

    if (videoResult.isFailure) {
      return Result.fail(videoResult.errorValue);
    }

    const video = videoResult.value;
    await this.videoRepo.save(video);

    return Result.ok(VideoMapper.toDTO(video));
  }
}
