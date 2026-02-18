import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';
import { Guard } from '../../shared/Guard.js';

interface VideoTitleProps {
  value: string;
}

export class VideoTitle extends ValueObject<VideoTitleProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 100;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: VideoTitleProps) {
    super(props);
  }

  static reconstitute(name: string): VideoTitle {
    return new VideoTitle({ value: name });
  }

  static create(name: string): Result<VideoTitle> {
    const trimmed = name.trim();

    const minGuard = Guard.againstAtLeast(this.MIN_LENGTH, trimmed, 'VideoTitle');
    if (minGuard.isFailure) return Result.fail(minGuard.errorValue);

    const maxGuard = Guard.againstAtMost(this.MAX_LENGTH, trimmed, 'VideoTitle');
    if (maxGuard.isFailure) return Result.fail(maxGuard.errorValue);

    return Result.ok(new VideoTitle({ value: trimmed }));
  }
}
