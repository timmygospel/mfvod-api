import 'dotenv/config';
import { createApp } from './app.js';
import { config } from '../../infrastructure/config/index.js';
import { logger } from '../../infrastructure/logger/index.js';
import { pool } from '../../infrastructure/db/pool.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'Server started');
});

function gracefulShutdown(signal: string): void {
  logger.info({ signal }, 'Received shutdown signal');
  server.close(() => {
    logger.info('HTTP server closed');
    pool
      .end()
      .then(() => {
        logger.info('Database pool drained');
        process.exit(0);
      })
      .catch((err: unknown) => {
        logger.error({ err }, 'Error draining database pool');
        process.exit(1);
      });
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
