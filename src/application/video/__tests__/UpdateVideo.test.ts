import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateVideo } from '../UpdateVideo.js';
import type { IVideoRepo } from '../../../domain/video/repos/IVideoRepo.js';
import { Video } from '../../../domain/video/Video.js';

describe('UpdateVideo', () => {
  let mockRepo: IVideoRepo;
  let useCase: UpdateVideo;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByCourseId: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new UpdateVideo(mockRepo);
  });

  it('should update a video', async () => {
    const video = Video.create({
      title: 'Original',
      courseId: '550e8400-e29b-41d4-a716-446655440000',
    }).value;
    vi.mocked(mockRepo.findById).mockResolvedValue(video);

    const result = await useCase.execute({
      id: video.id.toValue(),
      title: 'Updated',
      status: 'disabled',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.title).toBe('Updated');
    expect(result.value.status).toBe('disabled');
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('should fail when video not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Updated',
    });

    expect(result.isFailure).toBe(true);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should fail with invalid title', async () => {
    const video = Video.create({
      title: 'Original',
      courseId: '550e8400-e29b-41d4-a716-446655440000',
    }).value;
    vi.mocked(mockRepo.findById).mockResolvedValue(video);

    const result = await useCase.execute({ id: video.id.toValue(), title: '' });

    expect(result.isFailure).toBe(true);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
