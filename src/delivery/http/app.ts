import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { logger } from '../../infrastructure/logger/index.js';
import { config } from '../../infrastructure/config/index.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSwagger } from '../swagger/index.js';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());

  const allowlist = config.CORS_ALLOWLIST.split(',').filter(Boolean);
  app.use(
    cors({
      origin: allowlist.length > 0 ? allowlist : '*',
    }),
  );

  app.use(pinoHttp({ logger }));
  app.use(express.json());

  app.use(healthRouter);

  setupSwagger(app);

  app.use(errorHandler);

  return app;
}
