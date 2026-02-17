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
    '/courses': {
      get: {
        summary: 'List all courses',
        tags: ['Courses'],
        responses: {
          '200': {
            description: 'List of courses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Course' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a course',
        tags: ['Courses'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 3, maxLength: 100 },
                  description: { type: 'string', maxLength: 2000 },
                  status: { type: 'string', enum: ['active', 'archived'] },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Course created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Course' } },
                },
              },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/courses/{id}': {
      get: {
        summary: 'Get a course by ID',
        tags: ['Courses'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Course found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Course' } },
                },
              },
            },
          },
          '404': { description: 'Course not found' },
        },
      },
      put: {
        summary: 'Update a course',
        tags: ['Courses'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 3, maxLength: 100 },
                  description: { type: 'string', maxLength: 2000 },
                  status: { type: 'string', enum: ['active', 'archived'] },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Course updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Course' } },
                },
              },
            },
          },
          '404': { description: 'Course not found' },
        },
      },
      delete: {
        summary: 'Delete a course',
        tags: ['Courses'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '204': { description: 'Course deleted' },
          '404': { description: 'Course not found' },
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
  components: {
    schemas: {
      Course: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['active', 'archived'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
