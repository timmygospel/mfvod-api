import { Result } from '../../domain/shared/Result.js';
import type { IUserRepo } from '../../domain/user/repos/IUserRepo.js';
import { UserMapper, type UserDTO } from '../../infrastructure/db/mappers/UserMapper.js';
import { signAccessToken, signRefreshToken } from '../../infrastructure/auth/jwt.js';

interface LoginUserRequest {
  email: string;
  password: string;
}

interface LoginUserResponse {
  user: UserDTO;
  requiresTwoFactor: boolean;
  /** Present only when requiresTwoFactor is false */
  accessToken?: string;
  /** Present only when requiresTwoFactor is false */
  refreshToken?: string;
  /** Present only when requiresTwoFactor is true — temp token for 2FA step */
  preAuthToken?: string;
}

export class LoginUser {
  constructor(private readonly userRepo: IUserRepo) {}

  async execute(req: LoginUserRequest): Promise<Result<LoginUserResponse>> {
    const user = await this.userRepo.findByEmail(req.email);
    if (!user || !user.isActive) {
      return Result.fail('Invalid email or password.');
    }

    const passwordMatch = await user.password.compareWith(req.password);
    if (!passwordMatch) {
      return Result.fail('Invalid email or password.');
    }

    if (user.twoFactorEnabled) {
      // Issue a short-lived pre-auth token so the client can complete 2FA
      const preAuthToken = signAccessToken({
        sub: user.id.toValue(),
        email: user.email.value,
        role: user.role.value,
      });

      return Result.ok({
        user: UserMapper.toDTO(user),
        requiresTwoFactor: true,
        preAuthToken,
      });
    }

    const accessToken = signAccessToken({
      sub: user.id.toValue(),
      email: user.email.value,
      role: user.role.value,
    });
    const refreshToken = signRefreshToken({ sub: user.id.toValue() });

    return Result.ok({
      user: UserMapper.toDTO(user),
      requiresTwoFactor: false,
      accessToken,
      refreshToken,
    });
  }
}
