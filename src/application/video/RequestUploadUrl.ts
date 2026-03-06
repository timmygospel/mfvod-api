import type { IVideoRepo } from '../../domain/video/repos/IVideoRepo.js';
import type { MuxService } from '../../infrastructure/mux/MuxService.js';
import { Result } from '../../domain/shared/Result.js';

interface RequestUploadUrlInput {
  videoId: string;
  corsOrigin?: string;
}

interface UploadUrlDTO {
  uploadUrl: string;
  uploadId: string;
}

export class RequestUploadUrl {
  constructor(
    private readonly videoRepo: IVideoRepo,
    private readonly muxService: MuxService,
  ) {}

  async execute(input: RequestUploadUrlInput): Promise<Result<UploadUrlDTO>> {
    const video = await this.videoRepo.findById(input.videoId);
    if (!video) {
      return Result.fail(`Video not found: ${input.videoId}`);
    }

    const { uploadId, uploadUrl } = await this.muxService.createDirectUpload(
      input.corsOrigin ?? '*',
    );

    const updated = video.update({ muxUploadId: uploadId });
    if (updated.isFailure) return Result.fail(updated.errorValue);

    await this.videoRepo.save(updated.value);

    return Result.ok({ uploadUrl, uploadId });
  }
}
