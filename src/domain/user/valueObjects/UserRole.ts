import { ValueObject } from '../../shared/ValueObject.js';
import { Result } from '../../shared/Result.js';

export type UserRoleValue = 'admin' | 'subscriber';

interface UserRoleProps {
  value: UserRoleValue;
}

const VALID_ROLES: UserRoleValue[] = ['admin', 'subscriber'];

export class UserRole extends ValueObject<UserRoleProps> {
  get value(): UserRoleValue {
    return this.props.value;
  }

  get isAdmin(): boolean {
    return this.props.value === 'admin';
  }

  private constructor(props: UserRoleProps) {
    super(props);
  }

  static reconstitute(role: UserRoleValue): UserRole {
    return new UserRole({ value: role });
  }

  static create(role: string): Result<UserRole> {
    if (!VALID_ROLES.includes(role as UserRoleValue)) {
      return Result.fail(`UserRole must be one of: ${VALID_ROLES.join(', ')}.`);
    }
    return Result.ok(new UserRole({ value: role as UserRoleValue }));
  }
}
