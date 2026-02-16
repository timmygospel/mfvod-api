import { Router } from 'express';
import { pool } from '../../../infrastructure/db/pool.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

healthRouter.get('/ready', (_req, res, next) => {
  pool
    .query('SELECT 1')
    .then(() => {
      res.status(200).json({ status: 'ready' });
    })
    .catch((err: unknown) => {
      next(err);
    });
});
