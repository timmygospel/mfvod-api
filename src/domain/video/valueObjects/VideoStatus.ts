import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';

interface VideoStatusProps {
  value: 'active' | 'archived' | 'disabled';
}

const VALID_STATUSES = ['active', 'archived', 'disabled'] as const;

export class VideoStatus extends ValueObject<VideoStatusProps> {
  get value(): 'active' | 'archived' | 'disabled' {
    return this.props.value;
  }

  private constructor(props: VideoStatusProps) {
    super(props);
  }

  static reconstitute(status: 'active' | 'archived' | 'disabled'): VideoStatus {
    return new VideoStatus({ value: status });
  }

  static create(status?: string): Result<VideoStatus> {
    const val = status ?? 'active';

    if (!VALID_STATUSES.includes(val as (typeof VALID_STATUSES)[number])) {
      return Result.fail(
        `Invalid VideoStatus: "${val}". Must be one of: ${VALID_STATUSES.join(', ')}`,
      );
    }

    return Result.ok(new VideoStatus({ value: val as 'active' | 'archived' | 'disabled' }));
  }
}
