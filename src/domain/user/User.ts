import { AggregateRoot } from '../shared/AggregateRoot.js';
import { UniqueEntityID } from '../shared/UniqueEntityID.js';
import { Result } from '../shared/Result.js';
import { UserEmail } from './valueObjects/UserEmail.js';
import { UserPassword } from './valueObjects/UserPassword.js';
import { UserRole } from './valueObjects/UserRole.js';
import type { UserProps } from './UserProps.js';

interface CreateUserInput {
  email: string;
  password: string;
  role?: string;
}

interface ReconstituteInput {
  email: string;
  passwordHash: string;
  role: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<UserProps> {
  get email(): UserEmail {
    return this.props.email;
  }

  get password(): UserPassword {
    return this.props.password;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get twoFactorEnabled(): boolean {
    return this.props.twoFactorEnabled;
  }

  get twoFactorSecret(): string | null {
    return this.props.twoFactorSecret;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static async create(input: CreateUserInput): Promise<Result<User>> {
    const emailResult = UserEmail.create(input.email);
    if (emailResult.isFailure) return Result.fail(emailResult.errorValue);

    const passwordResult = await UserPassword.createHashed(input.password);
    if (passwordResult.isFailure) return Result.fail(passwordResult.errorValue);

    const roleResult = UserRole.create(input.role ?? 'subscriber');
    if (roleResult.isFailure) return Result.fail(roleResult.errorValue);

    const now = new Date();
    return Result.ok(
      new User({
        email: emailResult.value,
        password: passwordResult.value,
        role: roleResult.value,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static reconstitute(input: ReconstituteInput, id: UniqueEntityID): User {
    return new User(
      {
        email: UserEmail.reconstitute(input.email),
        password: UserPassword.reconstitute(input.passwordHash),
        role: UserRole.reconstitute(input.role as 'admin' | 'subscriber'),
        twoFactorEnabled: input.twoFactorEnabled,
        twoFactorSecret: input.twoFactorSecret,
        isActive: input.isActive,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      },
      id,
    );
  }

  setupTwoFactor(secret: string): void {
    this.props.twoFactorEnabled = true;
    this.props.twoFactorSecret = secret;
    this.props.updatedAt = new Date();
  }

  disableTwoFactor(): void {
    this.props.twoFactorEnabled = false;
    this.props.twoFactorSecret = null;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }
}
