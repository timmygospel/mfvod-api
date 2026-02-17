import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';
import { Guard } from '../../shared/Guard.js';

interface CourseNameProps {
  value: string;
}

export class CourseName extends ValueObject<CourseNameProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 100;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: CourseNameProps) {
    super(props);
  }

  static reconstitute(name: string): CourseName {
    return new CourseName({ value: name });
  }

  static create(name: string): Result<CourseName> {
    const trimmed = name.trim();

    const minGuard = Guard.againstAtLeast(this.MIN_LENGTH, trimmed, 'CourseName');
    if (minGuard.isFailure) return Result.fail(minGuard.errorValue);

    const maxGuard = Guard.againstAtMost(this.MAX_LENGTH, trimmed, 'CourseName');
    if (maxGuard.isFailure) return Result.fail(maxGuard.errorValue);

    return Result.ok(new CourseName({ value: trimmed }));
  }
}
