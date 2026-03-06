import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type AccessTokenPayload } from '../../../infrastructure/auth/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../../../shared/AppError.js';

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header.'));
  }

  const token = header.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token.'));
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== 'admin') {
    return next(new ForbiddenError('Admin access required.'));
  }
  next();
}
