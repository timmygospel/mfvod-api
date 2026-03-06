import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { MuxService } from '../../../infrastructure/mux/MuxService.js';
import type { IVideoRepo } from '../../../domain/video/repos/IVideoRepo.js';
import { logger } from '../../../infrastructure/logger/index.js';

export function createMuxRouter(muxService: MuxService, videoRepo: IVideoRepo): Router {
  const router = Router();

  // Raw body needed for signature verification — mount BEFORE express.json()
  router.post(
    '/webhook',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const rawBody = (req as Request & { rawBody?: string }).rawBody ?? '';
        const headers = req.headers as Record<string, string>;

        const valid = muxService.verifyWebhookSignature(rawBody, headers);
        if (!valid) {
          res.status(401).json({ error: 'Invalid webhook signature' });
          return;
        }

        const event = req.body as { type: string; data: Record<string, unknown> };

        if (event.type === 'video.upload.asset_created') {
          const uploadId = event.data.id as string;
          const assetId = (event.data.asset_id ?? (event.data as { asset?: { id: string } })?.asset?.id) as string | undefined;

          if (uploadId && assetId) {
            const video = await videoRepo.findByMuxUploadId(uploadId);
            if (video) {
              const updated = video.update({ muxAssetId: assetId });
              if (updated.isSuccess) await videoRepo.save(updated.value);
            }
          }
        }

        if (event.type === 'video.asset.ready') {
          const assetId = event.data.id as string;
          const playbackIds = event.data.playback_ids as Array<{ id: string }> | undefined;
          const playbackId = playbackIds?.[0]?.id ?? null;
          const duration =
            event.data.duration != null ? Math.round(event.data.duration as number) : null;

          const video = await videoRepo.findByMuxAssetId(assetId);
          if (video) {
            const updated = video.update({ muxPlaybackId: playbackId, duration });
            if (updated.isSuccess) await videoRepo.save(updated.value);
          }
        }

        if (event.type === 'video.asset.errored') {
          const assetId = event.data.id as string;
          logger.error({ assetId, event }, 'Mux asset errored');
        }

        res.status(200).json({ received: true });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
