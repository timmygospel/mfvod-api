import { AggregateRoot } from '../shared/AggregateRoot.js';
import { UniqueEntityID } from '../shared/UniqueEntityID.js';
import { Result } from '../shared/Result.js';
import { VideoTitle } from './valueObjects/VideoTitle.js';
import { VideoDescription } from './valueObjects/VideoDescription.js';
import { VideoStatus } from './valueObjects/VideoStatus.js';
import type { VideoProps } from './VideoProps.js';

interface CreateVideoInput {
  title: string;
  description?: string;
  status?: string;
  courseId: string;
  sortOrder?: number;
  thumbnailUrl?: string | null;
  muxAssetId?: string | null;
  muxPlaybackId?: string | null;
  duration?: number | null;
}

interface UpdateVideoInput {
  title?: string;
  description?: string;
  status?: string;
  sortOrder?: number;
  thumbnailUrl?: string | null;
  muxAssetId?: string | null;
  muxPlaybackId?: string | null;
  duration?: number | null;
}

interface ReconstituteInput {
  title: string;
  description: string;
  status: string;
  courseId: string;
  sortOrder: number;
  thumbnailUrl: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Video extends AggregateRoot<VideoProps> {
  get title(): VideoTitle {
    return this.props.title;
  }

  get description(): VideoDescription {
    return this.props.description;
  }

  get status(): VideoStatus {
    return this.props.status;
  }

  get courseId(): string {
    return this.props.courseId;
  }

  get sortOrder(): number {
    return this.props.sortOrder;
  }

  get thumbnailUrl(): string | null {
    return this.props.thumbnailUrl;
  }

  get muxAssetId(): string | null {
    return this.props.muxAssetId;
  }

  get muxPlaybackId(): string | null {
    return this.props.muxPlaybackId;
  }

  get duration(): number | null {
    return this.props.duration;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: VideoProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(input: CreateVideoInput): Result<Video> {
    const titleResult = VideoTitle.create(input.title);
    if (titleResult.isFailure) return Result.fail(titleResult.errorValue);

    const descResult = VideoDescription.create(input.description);
    if (descResult.isFailure) return Result.fail(descResult.errorValue);

    const statusResult = VideoStatus.create(input.status);
    if (statusResult.isFailure) return Result.fail(statusResult.errorValue);

    const now = new Date();
    return Result.ok(
      new Video({
        title: titleResult.value,
        description: descResult.value,
        status: statusResult.value,
        courseId: input.courseId,
        sortOrder: input.sortOrder ?? 0,
        thumbnailUrl: input.thumbnailUrl ?? null,
        muxAssetId: input.muxAssetId ?? null,
        muxPlaybackId: input.muxPlaybackId ?? null,
        duration: input.duration ?? null,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static reconstitute(input: ReconstituteInput, id: UniqueEntityID): Video {
    return new Video(
      {
        title: VideoTitle.reconstitute(input.title),
        description: VideoDescription.reconstitute(input.description),
        status: VideoStatus.reconstitute(input.status as 'active' | 'archived' | 'disabled'),
        courseId: input.courseId,
        sortOrder: input.sortOrder,
        thumbnailUrl: input.thumbnailUrl,
        muxAssetId: input.muxAssetId,
        muxPlaybackId: input.muxPlaybackId,
        duration: input.duration,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      },
      id,
    );
  }

  update(input: UpdateVideoInput): Result<Video> {
    const titleResult =
      input.title !== undefined ? VideoTitle.create(input.title) : Result.ok(this.props.title);
    if (titleResult.isFailure) return Result.fail(titleResult.errorValue);

    const descResult =
      input.description !== undefined
        ? VideoDescription.create(input.description)
        : Result.ok(this.props.description);
    if (descResult.isFailure) return Result.fail(descResult.errorValue);

    const statusResult =
      input.status !== undefined ? VideoStatus.create(input.status) : Result.ok(this.props.status);
    if (statusResult.isFailure) return Result.fail(statusResult.errorValue);

    return Result.ok(
      new Video(
        {
          title: titleResult.value,
          description: descResult.value,
          status: statusResult.value,
          courseId: this.props.courseId,
          sortOrder: input.sortOrder !== undefined ? input.sortOrder : this.props.sortOrder,
          thumbnailUrl:
            input.thumbnailUrl !== undefined ? input.thumbnailUrl : this.props.thumbnailUrl,
          muxAssetId: input.muxAssetId !== undefined ? input.muxAssetId : this.props.muxAssetId,
          muxPlaybackId:
            input.muxPlaybackId !== undefined ? input.muxPlaybackId : this.props.muxPlaybackId,
          duration: input.duration !== undefined ? input.duration : this.props.duration,
          createdAt: this.props.createdAt,
          updatedAt: new Date(),
        },
        this._id,
      ),
    );
  }
}
