import { Result } from '../../domain/shared/Result.js';
import { User } from '../../domain/user/User.js';
import type { IUserRepo } from '../../domain/user/repos/IUserRepo.js';
import { UserMapper, type UserDTO } from '../../infrastructure/db/mappers/UserMapper.js';
import { signAccessToken, signRefreshToken } from '../../infrastructure/auth/jwt.js';

interface RegisterUserRequest {
  email: string;
  password: string;
  role?: string;
}

interface RegisterUserResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

export class RegisterUser {
  constructor(private readonly userRepo: IUserRepo) {}

  async execute(req: RegisterUserRequest): Promise<Result<RegisterUserResponse>> {
    const alreadyExists = await this.userRepo.existsByEmail(req.email);
    if (alreadyExists) {
      return Result.fail('Email is already registered.');
    }

    const userResult = await User.create({
      email: req.email,
      password: req.password,
      role: req.role,
    });
    if (userResult.isFailure) return Result.fail(userResult.errorValue);

    const user = userResult.value;
    await this.userRepo.save(user);

    const accessToken = signAccessToken({
      sub: user.id.toValue(),
      email: user.email.value,
      role: user.role.value,
    });
    const refreshToken = signRefreshToken({ sub: user.id.toValue() });

    return Result.ok({ user: UserMapper.toDTO(user), accessToken, refreshToken });
  }
}
