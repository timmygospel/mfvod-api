import type { UserEmail } from './valueObjects/UserEmail.js';
import type { UserPassword } from './valueObjects/UserPassword.js';
import type { UserRole } from './valueObjects/UserRole.js';

export interface UserProps {
  email: UserEmail;
  password: UserPassword;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
