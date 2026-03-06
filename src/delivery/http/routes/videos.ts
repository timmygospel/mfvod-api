import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  createVideoSchema,
  updateVideoSchema,
  idParamSchema,
  courseIdParamSchema,
} from '../dtos/videoSchemas.js';
import { ValidationError, NotFoundError } from '../../../shared/AppError.js';
import type { Result } from '../../../domain/shared/Result.js';
import type { VideoDTO } from '../../../infrastructure/db/mappers/VideoMapper.js';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

interface UploadUrlDTO {
  uploadUrl: string;
  uploadId: string;
}

interface VideoUseCases {
  createVideo: {
    execute(req: {
      title: string;
      description?: string;
      status?: string;
      courseId: string;
      sortOrder?: number;
      thumbnailUrl?: string | null;
      muxAssetId?: string | null;
      muxPlaybackId?: string | null;
      duration?: number | null;
    }): Promise<Result<VideoDTO>>;
  };
  getVideoById: { execute(req: { id: string }): Promise<Result<VideoDTO>> };
  listVideos: { execute(): Promise<Result<VideoDTO[]>> };
  updateVideo: {
    execute(req: {
      id: string;
      title?: string;
      description?: string;
      status?: string;
      sortOrder?: number;
      thumbnailUrl?: string | null;
      muxAssetId?: string | null;
      muxPlaybackId?: string | null;
      duration?: number | null;
    }): Promise<Result<VideoDTO>>;
  };
  deleteVideo: { execute(req: { id: string }): Promise<Result<void>> };
  listVideosByCourse: { execute(req: { courseId: string }): Promise<Result<VideoDTO[]>> };
  requestUploadUrl: {
    execute(req: { videoId: string; corsOrigin?: string }): Promise<Result<UploadUrlDTO>>;
  };
}

export function createVideoRouter(useCases: VideoUseCases): Router {
  const router = Router();

  router.post(
    '/:id/upload-url',
    authMiddleware,
    requireAdmin,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const paramsParsed = idParamSchema.safeParse(req.params);
        if (!paramsParsed.success) {
          throw new ValidationError('Invalid video id format');
        }

        const origin = req.headers.origin ?? req.headers.referer ?? '*';
        const result = await useCases.requestUploadUrl.execute({
          videoId: paramsParsed.data.id,
          corsOrigin: typeof origin === 'string' ? origin : '*',
        });

        if (result.isFailure) {
          throw new NotFoundError(result.errorValue);
        }

        res.status(200).json({ data: result.value });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    '/:id/stream',
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const paramsParsed = idParamSchema.safeParse(req.params);
        if (!paramsParsed.success) {
          throw new ValidationError('Invalid video id format');
        }

        const result = await useCases.getVideoById.execute({ id: paramsParsed.data.id });
        if (result.isFailure) {
          throw new NotFoundError(result.errorValue);
        }

        const video = result.value;
        if (!video.muxPlaybackId) {
          throw new NotFoundError('Video is not yet ready for streaming');
        }

        res.status(200).json({
          data: {
            videoId: video.id,
            playbackId: video.muxPlaybackId,
            hlsUrl: `https://stream.mux.com/${video.muxPlaybackId}.m3u8`,
            thumbnailUrl: `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`,
          },
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createVideoSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
      }

      const result = await useCases.createVideo.execute(parsed.data);
      if (result.isFailure) {
        throw new ValidationError(result.errorValue);
      }

      res.status(201).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await useCases.listVideos.execute();
      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.get('/course/:courseId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramsParsed = courseIdParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new ValidationError('Invalid course id format');
      }

      const result = await useCases.listVideosByCourse.execute({
        courseId: paramsParsed.data.courseId,
      });
      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new ValidationError('Invalid video id format');
      }

      const result = await useCases.getVideoById.execute({ id: paramsParsed.data.id });
      if (result.isFailure) {
        throw new NotFoundError(result.errorValue);
      }

      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new ValidationError('Invalid video id format');
      }

      const bodyParsed = updateVideoSchema.safeParse(req.body);
      if (!bodyParsed.success) {
        throw new ValidationError(bodyParsed.error.issues.map((i) => i.message).join(', '));
      }

      const result = await useCases.updateVideo.execute({
        id: paramsParsed.data.id,
        ...bodyParsed.data,
      });

      if (result.isFailure) {
        throw new NotFoundError(result.errorValue);
      }

      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new ValidationError('Invalid video id format');
      }

      const result = await useCases.deleteVideo.execute({ id: paramsParsed.data.id });
      if (result.isFailure) {
        throw new NotFoundError(result.errorValue);
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
