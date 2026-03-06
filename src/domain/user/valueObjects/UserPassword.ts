import bcrypt from 'bcryptjs';
import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';

interface UserPasswordProps {
  hash: string;
  isHashed: boolean;
}

const MIN_LENGTH = 8;
const SALT_ROUNDS = 10;

function isStrong(password: string): boolean {
  if (password.length < MIN_LENGTH) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export class UserPassword extends ValueObject<UserPasswordProps> {
  get isHashed(): boolean {
    return this.props.isHashed;
  }

  /** Returns the bcrypt hash (safe to persist). */
  get hashValue(): string {
    return this.props.hash;
  }

  private constructor(props: UserPasswordProps) {
    super(props);
  }

  /** Reconstitute from a stored bcrypt hash — skips validation. */
  static reconstitute(hash: string): UserPassword {
    return new UserPassword({ hash, isHashed: true });
  }

  /** Validate raw password, hash it, and return the value object. */
  static async createHashed(rawPassword: string): Promise<Result<UserPassword>> {
    if (!isStrong(rawPassword)) {
      return Result.fail(
        `UserPassword must be at least ${MIN_LENGTH} characters and contain an uppercase letter and a number.`,
      );
    }

    const hash = await bcrypt.hash(rawPassword, SALT_ROUNDS);
    return Result.ok(new UserPassword({ hash, isHashed: true }));
  }

  async compareWith(rawPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, this.props.hash);
  }
}
