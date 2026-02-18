import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';
import { Guard } from '../../shared/Guard.js';

interface VideoDescriptionProps {
  value: string;
}

export class VideoDescription extends ValueObject<VideoDescriptionProps> {
  private static readonly MAX_LENGTH = 2000;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: VideoDescriptionProps) {
    super(props);
  }

  static reconstitute(description: string): VideoDescription {
    return new VideoDescription({ value: description });
  }

  static create(description?: string): Result<VideoDescription> {
    const text = description ?? '';

    const maxGuard = Guard.againstAtMost(this.MAX_LENGTH, text, 'VideoDescription');
    if (maxGuard.isFailure) return Result.fail(maxGuard.errorValue);

    return Result.ok(new VideoDescription({ value: text }));
  }
}
