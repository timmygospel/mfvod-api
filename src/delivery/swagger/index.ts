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
    '/categories': {
      get: {
        summary: 'List all categories',
        tags: ['Categories'],
        responses: {
          '200': {
            description: 'List of categories',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Category' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a category',
        tags: ['Categories'],
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
            description: 'Category created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Category' } },
                },
              },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/categories/{id}': {
      get: {
        summary: 'Get a category by ID',
        tags: ['Categories'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Category found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Category' } },
                },
              },
            },
          },
          '404': { description: 'Category not found' },
        },
      },
      put: {
        summary: 'Update a category',
        tags: ['Categories'],
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
            description: 'Category updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Category' } },
                },
              },
            },
          },
          '404': { description: 'Category not found' },
        },
      },
      delete: {
        summary: 'Delete a category',
        tags: ['Categories'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '204': { description: 'Category deleted' },
          '404': { description: 'Category not found' },
        },
      },
    },
    '/videos': {
      get: {
        summary: 'List all videos',
        tags: ['Videos'],
        responses: {
          '200': {
            description: 'List of videos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Video' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a video',
        tags: ['Videos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'courseId'],
                properties: {
                  title: { type: 'string', minLength: 3, maxLength: 100 },
                  description: { type: 'string', maxLength: 2000 },
                  status: { type: 'string', enum: ['active', 'archived', 'disabled'] },
                  courseId: { type: 'string', format: 'uuid' },
                  sortOrder: { type: 'integer' },
                  thumbnailUrl: { type: 'string', nullable: true },
                  muxAssetId: { type: 'string', nullable: true },
                  muxPlaybackId: { type: 'string', nullable: true },
                  duration: { type: 'integer', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Video created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Video' } },
                },
              },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/videos/{id}': {
      get: {
        summary: 'Get a video by ID',
        tags: ['Videos'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Video found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Video' } },
                },
              },
            },
          },
          '404': { description: 'Video not found' },
        },
      },
      put: {
        summary: 'Update a video',
        tags: ['Videos'],
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
                  title: { type: 'string', minLength: 3, maxLength: 100 },
                  description: { type: 'string', maxLength: 2000 },
                  status: { type: 'string', enum: ['active', 'archived', 'disabled'] },
                  sortOrder: { type: 'integer' },
                  thumbnailUrl: { type: 'string', nullable: true },
                  muxAssetId: { type: 'string', nullable: true },
                  muxPlaybackId: { type: 'string', nullable: true },
                  duration: { type: 'integer', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Video updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Video' } },
                },
              },
            },
          },
          '404': { description: 'Video not found' },
        },
      },
      delete: {
        summary: 'Delete a video',
        tags: ['Videos'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '204': { description: 'Video deleted' },
          '404': { description: 'Video not found' },
        },
      },
    },
    '/videos/course/{courseId}': {
      get: {
        summary: 'List videos by course',
        tags: ['Videos'],
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'List of videos for the course',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Video' },
                    },
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
      Category: {
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
      Video: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['active', 'archived', 'disabled'] },
          courseId: { type: 'string', format: 'uuid' },
          sortOrder: { type: 'integer' },
          thumbnailUrl: { type: 'string', nullable: true },
          muxAssetId: { type: 'string', nullable: true },
          muxPlaybackId: { type: 'string', nullable: true },
          duration: { type: 'integer', nullable: true },
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
