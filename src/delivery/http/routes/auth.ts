import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema, twoFactorVerifySchema, refreshSchema } from '../dtos/authSchemas.js';
import { ValidationError, UnauthorizedError } from '../../../shared/AppError.js';
import type { RegisterUser } from '../../../application/user/RegisterUser.js';
import type { LoginUser } from '../../../application/user/LoginUser.js';
import type { SetupTwoFactor } from '../../../application/user/SetupTwoFactor.js';
import type { VerifyTwoFactor } from '../../../application/user/VerifyTwoFactor.js';
import type { RefreshToken } from '../../../application/user/RefreshToken.js';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/authMiddleware.js';

interface AuthUseCases {
  registerUser: RegisterUser;
  loginUser: LoginUser;
  setupTwoFactor: SetupTwoFactor;
  verifyTwoFactor: VerifyTwoFactor;
  refreshToken: RefreshToken;
}

export function createAuthRouter(useCases: AuthUseCases): Router {
  const router = Router();

  // POST /auth/register
  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
      }

      const result = await useCases.registerUser.execute(parsed.data);
      if (result.isFailure) throw new ValidationError(result.errorValue);

      res.status(201).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  // POST /auth/login
  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
      }

      const result = await useCases.loginUser.execute(parsed.data);
      if (result.isFailure) throw new UnauthorizedError(result.errorValue);

      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  // POST /auth/2fa/setup  — requires valid access token
  router.post(
    '/2fa/setup',
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const userId = req.user!.sub;
        const result = await useCases.setupTwoFactor.execute({ userId });
        if (result.isFailure) throw new ValidationError(result.errorValue);

        res.status(200).json({ data: result.value });
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /auth/2fa/verify  — requires valid access token (pre-auth or full)
  router.post(
    '/2fa/verify',
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const parsed = twoFactorVerifySchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
        }

        const result = await useCases.verifyTwoFactor.execute({
          userId: req.user!.sub,
          code: parsed.data.code,
        });
        if (result.isFailure) throw new UnauthorizedError(result.errorValue);

        res.status(200).json({ data: result.value });
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /auth/refresh
  router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
      }

      const result = await useCases.refreshToken.execute({ refreshToken: parsed.data.refreshToken });
      if (result.isFailure) throw new UnauthorizedError(result.errorValue);

      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
