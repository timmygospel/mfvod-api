import { verify as totpVerify } from 'otplib';
import { Result } from '../../domain/shared/Result.js';
import type { IUserRepo } from '../../domain/user/repos/IUserRepo.js';
import { UserMapper, type UserDTO } from '../../infrastructure/db/mappers/UserMapper.js';
import { signAccessToken, signRefreshToken } from '../../infrastructure/auth/jwt.js';

interface VerifyTwoFactorRequest {
  userId: string;
  code: string;
}

interface VerifyTwoFactorResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

export class VerifyTwoFactor {
  constructor(private readonly userRepo: IUserRepo) {}

  async execute(req: VerifyTwoFactorRequest): Promise<Result<VerifyTwoFactorResponse>> {
    const user = await this.userRepo.findById(req.userId);
    if (!user) return Result.fail('User not found.');

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return Result.fail('Two-factor authentication is not set up for this account.');
    }

    const verifyResult = await totpVerify({ token: req.code, secret: user.twoFactorSecret });
    const isValid = verifyResult.valid;
    if (!isValid) {
      return Result.fail('Invalid or expired two-factor code.');
    }

    const accessToken = signAccessToken({
      sub: user.id.toValue(),
      email: user.email.value,
      role: user.role.value,
    });
    const refreshToken = signRefreshToken({ sub: user.id.toValue() });

    return Result.ok({ user: UserMapper.toDTO(user), accessToken, refreshToken });
  }
}
