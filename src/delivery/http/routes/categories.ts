import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createCategorySchema, updateCategorySchema } from '../dtos/categorySchemas.js';
import { idParamSchema } from '../dtos/courseSchemas.js';
import { ValidationError, NotFoundError } from '../../../shared/AppError.js';
import type { Result } from '../../../domain/shared/Result.js';
import type { CategoryDTO } from '../../../infrastructure/db/mappers/CategoryMapper.js';

interface CategoryUseCases {
  createCategory: {
    execute(req: {
      name: string;
      description?: string;
      status?: string;
    }): Promise<Result<CategoryDTO>>;
  };
  getCategoryById: { execute(req: { id: string }): Promise<Result<CategoryDTO>> };
  listCategories: { execute(): Promise<Result<CategoryDTO[]>> };
  updateCategory: {
    execute(req: {
      id: string;
      name?: string;
      description?: string;
      status?: string;
    }): Promise<Result<CategoryDTO>>;
  };
  deleteCategory: { execute(req: { id: string }): Promise<Result<void>> };
}

export function createCategoryRouter(useCases: CategoryUseCases): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
      }

      const result = await useCases.createCategory.execute(parsed.data);
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
      const result = await useCases.listCategories.execute();
      res.status(200).json({ data: result.value });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramsParsed = idParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        throw new ValidationError('Invalid category id format');
      }

      const result = await useCases.getCategoryById.execute({ id: paramsParsed.data.id });
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
        throw new ValidationError('Invalid category id format');
      }

      const bodyParsed = updateCategorySchema.safeParse(req.body);
      if (!bodyParsed.success) {
        throw new ValidationError(bodyParsed.error.issues.map((i) => i.message).join(', '));
      }

      const result = await useCases.updateCategory.execute({
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
        throw new ValidationError('Invalid category id format');
      }

      const result = await useCases.deleteCategory.execute({ id: paramsParsed.data.id });
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
