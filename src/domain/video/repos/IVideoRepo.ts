import type { Video } from '../Video.js';

export interface IVideoRepo {
  findById(id: string): Promise<Video | null>;
  findAll(): Promise<Video[]>;
  findByCourseId(courseId: string): Promise<Video[]>;
  save(video: Video): Promise<void>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
