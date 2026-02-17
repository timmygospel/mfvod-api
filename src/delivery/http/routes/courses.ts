import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createCourseSchema, updateCourseSchema, idParamSchema } from '../dtos/courseSchemas.js';
import { ValidationError, NotFoundError } from '../../../shared/AppError.js';
import type { Result } from '../../../domain/shared/Result.js';
import type { CourseDTO } from '../../../infrastructure/db/mappers/CourseMapper.js';

interface CourseUseCases {
  createCourse: {
    execute(req: {
      name: string;
      description?: string;
      status?: string;
    }): Promise<Result<CourseDTO>>;
  };
  getCourseById: { execute(req: { id: string }): Promise<Result<CourseDTO>> };
  listCourses: { execute(): Promise<Result<CourseDTO[]>> };
  updateCourse: {
    execute(req: {
      id: string;
      name?: string;
      description?: string;
      status?: string;
    }): Promise<Result<CourseDTO>>;
  };
  deleteCourse: { execute(req: { id: string }): Promise<Result<void>> };
}

export function createCourseRouter(useCases: CourseUseCases): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createCourseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
      }

      const result = await useCases.createCourse.execute(parsed.data);
      if (result.isFailure) {
        throw new ValidationError(result.errorValue);
      }

      res.status(201).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await useCases.listCourses.execute();
      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new ValidationError('Invalid course id format');
      }

      const result = await useCases.getCourseById.execute({ id: paramsParsed.data.id });
      if (result.isFailure) {
        throw new NotFoundError(result.errorValue);
      }

      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new ValidationError('Invalid course id format');
      }

      const bodyParsed = updateCourseSchema.safeParse(req.body);
      if (!bodyParsed.success) {
        throw new ValidationError(bodyParsed.error.issues.map((i) => i.message).join(', '));
      }

      const result = await useCases.updateCourse.execute({
        id: paramsParsed.data.id,
        ...bodyParsed.data,
      });

      if (result.isFailure) {
        throw new NotFoundError(result.errorValue);
      }

      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new ValidationError('Invalid course id format');
      }

      const result = await useCases.deleteCourse.execute({ id: paramsParsed.data.id });
      if (result.isFailure) {
        throw new NotFoundError(result.errorValue);
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
