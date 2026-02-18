import { Video } from '../../../domain/video/Video.js';
import { UniqueEntityID } from '../../../domain/shared/UniqueEntityID.js';

export interface VideoPersistence {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'archived' | 'disabled';
  course_id: string;
  sort_order: number;
  thumbnail_url: string | null;
  mux_asset_id: string | null;
  mux_playback_id: string | null;
  duration: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface VideoDTO {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'archived' | 'disabled';
  courseId: string;
  sortOrder: number;
  thumbnailUrl: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export class VideoMapper {
  static toDomain(raw: VideoPersistence): Video {
    return Video.reconstitute(
      {
        title: raw.title,
        description: raw.description,
        status: raw.status,
        courseId: raw.course_id,
        sortOrder: raw.sort_order,
        thumbnailUrl: raw.thumbnail_url,
        muxAssetId: raw.mux_asset_id,
        muxPlaybackId: raw.mux_playback_id,
        duration: raw.duration,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(video: Video): VideoPersistence {
    return {
      id: video.id.toValue(),
      title: video.title.value,
      description: video.description.value,
      status: video.status.value,
      course_id: video.courseId,
      sort_order: video.sortOrder,
      thumbnail_url: video.thumbnailUrl,
      mux_asset_id: video.muxAssetId,
      mux_playback_id: video.muxPlaybackId,
      duration: video.duration,
      created_at: video.createdAt,
      updated_at: video.updatedAt,
    };
  }

  static toDTO(video: Video): VideoDTO {
    return {
      id: video.id.toValue(),
      title: video.title.value,
      description: video.description.value,
      status: video.status.value,
      courseId: video.courseId,
      sortOrder: video.sortOrder,
      thumbnailUrl: video.thumbnailUrl,
      muxAssetId: video.muxAssetId,
      muxPlaybackId: video.muxPlaybackId,
      duration: video.duration,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    };
  }
}
