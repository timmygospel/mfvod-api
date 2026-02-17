import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';

interface CourseStatusProps {
  value: 'active' | 'archived';
}

const VALID_STATUSES = ['active', 'archived'] as const;

export class CourseStatus extends ValueObject<CourseStatusProps> {
  get value(): 'active' | 'archived' {
    return this.props.value;
  }

  private constructor(props: CourseStatusProps) {
    super(props);
  }

  static reconstitute(status: 'active' | 'archived'): CourseStatus {
    return new CourseStatus({ value: status });
  }

  static create(status?: string): Result<CourseStatus> {
    const val = status ?? 'active';

    if (!VALID_STATUSES.includes(val as (typeof VALID_STATUSES)[number])) {
      return Result.fail(
        `Invalid CourseStatus: "${val}". Must be one of: ${VALID_STATUSES.join(', ')}`,
      );
    }

    return Result.ok(new CourseStatus({ value: val as 'active' | 'archived' }));
  }
}
