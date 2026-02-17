import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';
import { Guard } from '../../shared/Guard.js';

interface CourseDescriptionProps {
  value: string;
}

export class CourseDescription extends ValueObject<CourseDescriptionProps> {
  private static readonly MAX_LENGTH = 2000;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: CourseDescriptionProps) {
    super(props);
  }

  static reconstitute(description: string): CourseDescription {
    return new CourseDescription({ value: description });
  }

  static create(description?: string): Result<CourseDescription> {
    const text = description ?? '';

    const maxGuard = Guard.againstAtMost(this.MAX_LENGTH, text, 'CourseDescription');
    if (maxGuard.isFailure) return Result.fail(maxGuard.errorValue);

    return Result.ok(new CourseDescription({ value: text }));
  }
}
