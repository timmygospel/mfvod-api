import { generateSecret, generateURI } from 'otplib';
import { Result } from '../../domain/shared/Result.js';
import type { IUserRepo } from '../../domain/user/repos/IUserRepo.js';

interface SetupTwoFactorRequest {
  userId: string;
}

interface SetupTwoFactorResponse {
  secret: string;
  qrCodeUri: string;
}

export class SetupTwoFactor {
  constructor(private readonly userRepo: IUserRepo) {}

  async execute(req: SetupTwoFactorRequest): Promise<Result<SetupTwoFactorResponse>> {
    const user = await this.userRepo.findById(req.userId);
    if (!user) return Result.fail('User not found.');

    const secret = generateSecret();
    const qrCodeUri = generateURI({
      strategy: 'totp',
      label: user.email.value,
      secret,
      issuer: 'mfvod',
    });

    user.setupTwoFactor(secret);
    await this.userRepo.save(user);

    return Result.ok({ secret, qrCodeUri });
  }
}
