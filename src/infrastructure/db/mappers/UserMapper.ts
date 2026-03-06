import { User } from '../../../domain/user/User.js';
import { UniqueEntityID } from '../../../domain/shared/UniqueEntityID.js';

export interface UserPersistence {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'subscriber';
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  role: 'admin' | 'subscriber';
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class UserMapper {
  static toDomain(raw: UserPersistence): User {
    return User.reconstitute(
      {
        email: raw.email,
        passwordHash: raw.password_hash,
        role: raw.role,
        twoFactorEnabled: raw.two_factor_enabled,
        twoFactorSecret: raw.two_factor_secret,
        isActive: raw.is_active,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(user: User): UserPersistence {
    return {
      id: user.id.toValue(),
      email: user.email.value,
      password_hash: user.password.hashValue,
      role: user.role.value,
      two_factor_enabled: user.twoFactorEnabled,
      two_factor_secret: user.twoFactorSecret,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  static toDTO(user: User): UserDTO {
    return {
      id: user.id.toValue(),
      email: user.email.value,
      role: user.role.value,
      twoFactorEnabled: user.twoFactorEnabled,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
