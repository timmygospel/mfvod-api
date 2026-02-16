import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'MFVOD API',
    version: '0.1.0',
    description: 'Video-on-demand subscription API',
  },
  servers: [
    {
      url: '/api',
      description: 'API server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is alive',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/ready': {
      get: {
        summary: 'Readiness check',
        responses: {
          '200': {
            description: 'Service is ready (DB connected)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ready' },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Service is not ready',
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
