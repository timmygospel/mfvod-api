import { describe, it, expect } from 'vitest';
import { Video } from '../Video.js';
import { UniqueEntityID } from '../../shared/UniqueEntityID.js';

describe('Video', () => {
  const validCourseId = '550e8400-e29b-41d4-a716-446655440000';

  it('should create a valid video with minimal props', () => {
    const result = Video.create({ title: 'Intro to DDD', courseId: validCourseId });
    expect(result.isSuccess).toBe(true);

    const video = result.value;
    expect(video.title.value).toBe('Intro to DDD');
    expect(video.description.value).toBe('');
    expect(video.status.value).toBe('active');
    expect(video.courseId).toBe(validCourseId);
    expect(video.sortOrder).toBe(0);
    expect(video.thumbnailUrl).toBeNull();
    expect(video.muxAssetId).toBeNull();
    expect(video.muxPlaybackId).toBeNull();
    expect(video.duration).toBeNull();
    expect(video.createdAt).toBeInstanceOf(Date);
    expect(video.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a video with all props', () => {
    const result = Video.create({
      title: 'Advanced DDD',
      description: 'Deep dive into DDD',
      status: 'archived',
      courseId: validCourseId,
      sortOrder: 5,
      thumbnailUrl: 'https://example.com/thumb.jpg',
      muxAssetId: 'mux-asset-123',
      muxPlaybackId: 'mux-playback-456',
      duration: 3600,
    });
    expect(result.isSuccess).toBe(true);

    const video = result.value;
    expect(video.title.value).toBe('Advanced DDD');
    expect(video.description.value).toBe('Deep dive into DDD');
    expect(video.status.value).toBe('archived');
    expect(video.sortOrder).toBe(5);
    expect(video.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    expect(video.muxAssetId).toBe('mux-asset-123');
    expect(video.muxPlaybackId).toBe('mux-playback-456');
    expect(video.duration).toBe(3600);
  });

  it('should fail when title is invalid', () => {
    const result = Video.create({ title: '', courseId: validCourseId });
    expect(result.isFailure).toBe(true);
  });

  it('should fail when description is too long', () => {
    const result = Video.create({
      title: 'Valid',
      courseId: validCourseId,
      description: 'a'.repeat(2001),
    });
    expect(result.isFailure).toBe(true);
  });

  it('should fail when status is invalid', () => {
    const result = Video.create({ title: 'Valid', courseId: validCourseId, status: 'draft' });
    expect(result.isFailure).toBe(true);
  });

  it('should reconstitute from persistence', () => {
    const id = new UniqueEntityID();
    const now = new Date();
    const video = Video.reconstitute(
      {
        title: 'Reconstituted',
        description: 'From DB',
        status: 'disabled',
        courseId: validCourseId,
        sortOrder: 3,
        thumbnailUrl: 'https://example.com/thumb.jpg',
        muxAssetId: 'mux-asset-123',
        muxPlaybackId: 'mux-playback-456',
        duration: 120,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );

    expect(video.id.equals(id)).toBe(true);
    expect(video.title.value).toBe('Reconstituted');
    expect(video.description.value).toBe('From DB');
    expect(video.status.value).toBe('disabled');
    expect(video.courseId).toBe(validCourseId);
    expect(video.sortOrder).toBe(3);
    expect(video.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    expect(video.muxAssetId).toBe('mux-asset-123');
    expect(video.muxPlaybackId).toBe('mux-playback-456');
    expect(video.duration).toBe(120);
    expect(video.createdAt).toBe(now);
    expect(video.updatedAt).toBe(now);
  });

  it('should update fields and bump updatedAt', () => {
    const createResult = Video.create({ title: 'Original', courseId: validCourseId });
    const video = createResult.value;
    const originalUpdatedAt = video.updatedAt;

    const updateResult = video.update({ title: 'Updated Title', status: 'disabled', sortOrder: 10 });
    expect(updateResult.isSuccess).toBe(true);

    const updated = updateResult.value;
    expect(updated.title.value).toBe('Updated Title');
    expect(updated.status.value).toBe('disabled');
    expect(updated.sortOrder).toBe(10);
    expect(updated.description.value).toBe('');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
  });

  it('should fail update with invalid title', () => {
    const video = Video.create({ title: 'Original', courseId: validCourseId }).value;
    const result = video.update({ title: '' });
    expect(result.isFailure).toBe(true);
  });

  it('should support equality by id', () => {
    const id = new UniqueEntityID();
    const now = new Date();
    const base = {
      title: 'A',
      description: '',
      status: 'active' as const,
      courseId: validCourseId,
      sortOrder: 0,
      thumbnailUrl: null,
      muxAssetId: null,
      muxPlaybackId: null,
      duration: null,
      createdAt: now,
      updatedAt: now,
    };
    const a = Video.reconstitute(base, id);
    const b = Video.reconstitute({ ...base, title: 'B' }, id);
    expect(a.equals(b)).toBe(true);
  });
});
