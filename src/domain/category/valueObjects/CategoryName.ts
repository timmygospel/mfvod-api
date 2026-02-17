import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';
import { Guard } from '../../shared/Guard.js';

interface CategoryNameProps {
  value: string;
}

export class CategoryName extends ValueObject<CategoryNameProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 100;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: CategoryNameProps) {
    super(props);
  }

  static reconstitute(name: string): CategoryName {
    return new CategoryName({ value: name });
  }

  static create(name: string): Result<CategoryName> {
    const trimmed = name.trim();

    const minGuard = Guard.againstAtLeast(this.MIN_LENGTH, trimmed, 'CategoryName');
    if (minGuard.isFailure) return Result.fail(minGuard.errorValue);

    const maxGuard = Guard.againstAtMost(this.MAX_LENGTH, trimmed, 'CategoryName');
    if (maxGuard.isFailure) return Result.fail(maxGuard.errorValue);

    return Result.ok(new CategoryName({ value: trimmed }));
  }
}
