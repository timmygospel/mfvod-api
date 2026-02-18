import type { Pool } from 'pg';
import type { IVideoRepo } from '../../../domain/video/repos/IVideoRepo.js';
import type { Video } from '../../../domain/video/Video.js';
import { VideoMapper, type VideoPersistence } from '../mappers/VideoMapper.js';

export class PgVideoRepo implements IVideoRepo {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Video | null> {
    const result = await this.pool.query<VideoPersistence>(
      'SELECT id, title, description, status, course_id, sort_order, thumbnail_url, mux_asset_id, mux_playback_id, duration, created_at, updated_at FROM videos WHERE id = $1',
      [id],
    );

    const row = result.rows[0];
    if (!row) return null;

    return VideoMapper.toDomain(row);
  }

  async findAll(): Promise<Video[]> {
    const result = await this.pool.query<VideoPersistence>(
      'SELECT id, title, description, status, course_id, sort_order, thumbnail_url, mux_asset_id, mux_playback_id, duration, created_at, updated_at FROM videos ORDER BY created_at DESC',
    );

    return result.rows.map((r) => VideoMapper.toDomain(r));
  }

  async findByCourseId(courseId: string): Promise<Video[]> {
    const result = await this.pool.query<VideoPersistence>(
      'SELECT id, title, description, status, course_id, sort_order, thumbnail_url, mux_asset_id, mux_playback_id, duration, created_at, updated_at FROM videos WHERE course_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [courseId],
    );

    return result.rows.map((r) => VideoMapper.toDomain(r));
  }

  async save(video: Video): Promise<void> {
    const raw = VideoMapper.toPersistence(video);

    await this.pool.query(
      `INSERT INTO videos (id, title, description, status, course_id, sort_order, thumbnail_url, mux_asset_id, mux_playback_id, duration, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         status = EXCLUDED.status,
         sort_order = EXCLUDED.sort_order,
         thumbnail_url = EXCLUDED.thumbnail_url,
         mux_asset_id = EXCLUDED.mux_asset_id,
         mux_playback_id = EXCLUDED.mux_playback_id,
         duration = EXCLUDED.duration,
         updated_at = EXCLUDED.updated_at`,
      [
        raw.id,
        raw.title,
        raw.description,
        raw.status,
        raw.course_id,
        raw.sort_order,
        raw.thumbnail_url,
        raw.mux_asset_id,
        raw.mux_playback_id,
        raw.duration,
        raw.created_at,
        raw.updated_at,
      ],
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM videos WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.pool.query('SELECT 1 FROM videos WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
