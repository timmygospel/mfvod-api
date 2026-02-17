import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';
import { Guard } from '../../shared/Guard.js';

interface CategoryDescriptionProps {
  value: string;
}

export class CategoryDescription extends ValueObject<CategoryDescriptionProps> {
  private static readonly MAX_LENGTH = 2000;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: CategoryDescriptionProps) {
    super(props);
  }

  static reconstitute(description: string): CategoryDescription {
    return new CategoryDescription({ value: description });
  }

  static create(description?: string): Result<CategoryDescription> {
    const text = description ?? '';

    const maxGuard = Guard.againstAtMost(this.MAX_LENGTH, text, 'CategoryDescription');
    if (maxGuard.isFailure) return Result.fail(maxGuard.errorValue);

    return Result.ok(new CategoryDescription({ value: text }));
  }
}
