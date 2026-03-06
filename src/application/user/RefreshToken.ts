import { Result } from '../../domain/shared/Result.js';
import type { IUserRepo } from '../../domain/user/repos/IUserRepo.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../infrastructure/auth/jwt.js';

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshToken {
  constructor(private readonly userRepo: IUserRepo) {}

  async execute(req: RefreshTokenRequest): Promise<Result<RefreshTokenResponse>> {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(req.refreshToken);
    } catch {
      return Result.fail('Invalid or expired refresh token.');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user || !user.isActive) {
      return Result.fail('User not found or inactive.');
    }

    const accessToken = signAccessToken({
      sub: user.id.toValue(),
      email: user.email.value,
      role: user.role.value,
    });
    const refreshToken = signRefreshToken({ sub: user.id.toValue() });

    return Result.ok({ accessToken, refreshToken });
  }
}
