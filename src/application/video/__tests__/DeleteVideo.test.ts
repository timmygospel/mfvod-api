import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteVideo } from '../DeleteVideo.js';
import type { IVideoRepo } from '../../../domain/video/repos/IVideoRepo.js';

describe('DeleteVideo', () => {
  let mockRepo: IVideoRepo;
  let useCase: DeleteVideo;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByCourseId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn().mockResolvedValue(true),
      exists: vi.fn(),
    };
    useCase = new DeleteVideo(mockRepo);
  });

  it('should delete a video', async () => {
    const result = await useCase.execute({ id: '550e8400-e29b-41d4-a716-446655440000' });

    expect(result.isSuccess).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should fail when video not found', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue(false);

    const result = await useCase.execute({ id: '550e8400-e29b-41d4-a716-446655440000' });

    expect(result.isFailure).toBe(true);
  });
});
