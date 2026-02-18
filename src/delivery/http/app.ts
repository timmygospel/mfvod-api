import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { logger } from '../../infrastructure/logger/index.js';
import { config } from '../../infrastructure/config/index.js';
import { healthRouter } from './routes/health.js';
import { createCourseRouter } from './routes/courses.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSwagger } from '../swagger/index.js';
import { pool } from '../../infrastructure/db/pool.js';
import { PgCourseRepo } from '../../infrastructure/db/repos/PgCourseRepo.js';
import { CreateCourse } from '../../application/course/CreateCourse.js';
import { GetCourseById } from '../../application/course/GetCourseById.js';
import { ListCourses } from '../../application/course/ListCourses.js';
import { UpdateCourse } from '../../application/course/UpdateCourse.js';
import { DeleteCourse } from '../../application/course/DeleteCourse.js';
import { PgCategoryRepo } from '../../infrastructure/db/repos/PgCategoryRepo.js';
import { CreateCategory } from '../../application/category/CreateCategory.js';
import { GetCategoryById } from '../../application/category/GetCategoryById.js';
import { ListCategories } from '../../application/category/ListCategories.js';
import { UpdateCategory } from '../../application/category/UpdateCategory.js';
import { DeleteCategory } from '../../application/category/DeleteCategory.js';
import { createCategoryRouter } from './routes/categories.js';
import { PgVideoRepo } from '../../infrastructure/db/repos/PgVideoRepo.js';
import { CreateVideo } from '../../application/video/CreateVideo.js';
import { GetVideoById } from '../../application/video/GetVideoById.js';
import { ListVideos } from '../../application/video/ListVideos.js';
import { UpdateVideo } from '../../application/video/UpdateVideo.js';
import { DeleteVideo } from '../../application/video/DeleteVideo.js';
import { ListVideosByCourse } from '../../application/video/ListVideosByCourse.js';
import { createVideoRouter } from './routes/videos.js';

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

  const courseRepo = new PgCourseRepo(pool);
  const courseRouter = createCourseRouter({
    createCourse: new CreateCourse(courseRepo),
    getCourseById: new GetCourseById(courseRepo),
    listCourses: new ListCourses(courseRepo),
    updateCourse: new UpdateCourse(courseRepo),
    deleteCourse: new DeleteCourse(courseRepo),
  });
  app.use('/courses', courseRouter);

  const categoryRepo = new PgCategoryRepo(pool);
  const categoryRouter = createCategoryRouter({
    createCategory: new CreateCategory(categoryRepo),
    getCategoryById: new GetCategoryById(categoryRepo),
    listCategories: new ListCategories(categoryRepo),
    updateCategory: new UpdateCategory(categoryRepo),
    deleteCategory: new DeleteCategory(categoryRepo),
  });
  app.use('/categories', categoryRouter);

  const videoRepo = new PgVideoRepo(pool);
  const videoRouter = createVideoRouter({
    createVideo: new CreateVideo(videoRepo, courseRepo),
    getVideoById: new GetVideoById(videoRepo),
    listVideos: new ListVideos(videoRepo),
    updateVideo: new UpdateVideo(videoRepo),
    deleteVideo: new DeleteVideo(videoRepo),
    listVideosByCourse: new ListVideosByCourse(videoRepo),
  });
  app.use('/videos', videoRouter);

  setupSwagger(app);

  app.use(errorHandler);

  return app;
}
