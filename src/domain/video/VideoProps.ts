import type { VideoTitle } from './valueObjects/VideoTitle.js';
import type { VideoDescription } from './valueObjects/VideoDescription.js';
import type { VideoStatus } from './valueObjects/VideoStatus.js';

export interface VideoProps {
  title: VideoTitle;
  description: VideoDescription;
  status: VideoStatus;
  courseId: string;
  sortOrder: number;
  thumbnailUrl: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}
