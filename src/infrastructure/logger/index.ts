import pino from 'pino';
import { config } from '../config/index.js';

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  transport:
    config.NODE_ENV === 'development'
      ? {
          target: 'pino/file',
          options: { destination: 1 },
        }
      : undefined,
});
