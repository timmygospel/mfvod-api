import type { Video } from '../Video.js';

export interface IVideoRepo {
  findById(id: string): Promise<Video | null>;
  findAll(): Promise<Video[]>;
  findByCourseId(courseId: string): Promise<Video[]>;
  findByMuxUploadId(uploadId: string): Promise<Video | null>;
  findByMuxAssetId(assetId: string): Promise<Video | null>;
  save(video: Video): Promise<void>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
