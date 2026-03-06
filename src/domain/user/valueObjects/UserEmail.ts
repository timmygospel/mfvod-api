import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';

interface UserEmailProps {
  value: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserEmail extends ValueObject<UserEmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserEmailProps) {
    super(props);
  }

  static reconstitute(email: string): UserEmail {
    return new UserEmail({ value: email });
  }

  static create(email: string): Result<UserEmail> {
    const normalised = email.trim().toLowerCase();

    if (!normalised || !EMAIL_REGEX.test(normalised)) {
      return Result.fail('UserEmail must be a valid email address.');
    }

    return Result.ok(new UserEmail({ value: normalised }));
  }
}
