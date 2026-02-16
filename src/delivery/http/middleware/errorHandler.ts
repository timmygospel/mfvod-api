import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/AppError.js';
import { config } from '../../../infrastructure/config/index.js';
import { logger } from '../../../infrastructure/logger/index.js';
import type { ErrorResponse } from '../../../shared/types.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string | undefined;

  if (err instanceof AppError) {
    const body: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  logger.error({ err, requestId }, 'Unhandled error');

  const body: ErrorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      requestId,
    },
  };
  res.status(500).json(body);
}
