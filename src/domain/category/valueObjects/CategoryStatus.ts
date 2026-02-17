import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';

interface CategoryStatusProps {
  value: 'active' | 'archived';
}

const VALID_STATUSES = ['active', 'archived'] as const;

export class CategoryStatus extends ValueObject<CategoryStatusProps> {
  get value(): 'active' | 'archived' {
    return this.props.value;
  }

  private constructor(props: CategoryStatusProps) {
    super(props);
  }

  static reconstitute(status: 'active' | 'archived'): CategoryStatus {
    return new CategoryStatus({ value: status });
  }

  static create(status?: string): Result<CategoryStatus> {
    const val = status ?? 'active';

    if (!VALID_STATUSES.includes(val as (typeof VALID_STATUSES)[number])) {
      return Result.fail(
        `Invalid CategoryStatus: "${val}". Must be one of: ${VALID_STATUSES.join(', ')}`,
      );
    }

    return Result.ok(new CategoryStatus({ value: val as 'active' | 'archived' }));
  }
}
