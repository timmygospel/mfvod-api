import Mux from '@mux/mux-node';
import { config } from '../config/index.js';

export interface MuxUpload {
  uploadId: string;
  uploadUrl: string;
}

export interface MuxAssetInfo {
  assetId: string;
  playbackId: string | null;
  duration: number | null;
  status: string;
}

export class MuxService {
  private readonly mux: Mux;

  constructor() {
    this.mux = new Mux({
      tokenId: config.MUX_TOKEN_ID,
      tokenSecret: config.MUX_TOKEN_SECRET,
    });
  }

  async createDirectUpload(corsOrigin: string): Promise<MuxUpload> {
    const upload = await this.mux.video.uploads.create({
      cors_origin: corsOrigin,
      new_asset_settings: {
        playback_policy: ['public'],
        encoding_tier: 'baseline',
      },
    });

    return {
      uploadId: upload.id,
      uploadUrl: upload.url,
    };
  }

  async getAsset(assetId: string): Promise<MuxAssetInfo> {
    const asset = await this.mux.video.assets.retrieve(assetId);
    const playbackId = asset.playback_ids?.[0]?.id ?? null;
    const duration = asset.duration != null ? Math.round(asset.duration) : null;

    return {
      assetId: asset.id,
      playbackId,
      duration,
      status: asset.status ?? 'preparing',
    };
  }

  async deleteAsset(assetId: string): Promise<void> {
    await this.mux.video.assets.delete(assetId);
  }

  verifyWebhookSignature(rawBody: string, headers: Record<string, string>): boolean {
    try {
      this.mux.webhooks.verifySignature(rawBody, headers, config.MUX_WEBHOOK_SECRET);
      return true;
    } catch {
      return false;
    }
  }
}
