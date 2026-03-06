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
import { RequestUploadUrl } from '../../application/video/RequestUploadUrl.js';
import { MuxService } from '../../infrastructure/mux/MuxService.js';
import { createVideoRouter } from './routes/videos.js';
import { createMuxRouter } from './routes/mux.js';
import { PgUserRepo } from '../../infrastructure/db/repos/PgUserRepo.js';
import { RegisterUser } from '../../application/user/RegisterUser.js';
import { LoginUser } from '../../application/user/LoginUser.js';
import { SetupTwoFactor } from '../../application/user/SetupTwoFactor.js';
import { VerifyTwoFactor } from '../../application/user/VerifyTwoFactor.js';
import { RefreshToken } from '../../application/user/RefreshToken.js';
import { createAuthRouter } from './routes/auth.js';

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

  // Capture raw body for Mux webhook signature verification
  app.use(
    '/mux/webhook',
    express.raw({ type: 'application/json' }),
    (req, _res, next) => {
      (req as typeof req & { rawBody: string }).rawBody = req.body.toString('utf8');
      next();
    },
  );

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
  const muxService = new MuxService();
  const videoRouter = createVideoRouter({
    createVideo: new CreateVideo(videoRepo, courseRepo),
    getVideoById: new GetVideoById(videoRepo),
    listVideos: new ListVideos(videoRepo),
    updateVideo: new UpdateVideo(videoRepo),
    deleteVideo: new DeleteVideo(videoRepo),
    listVideosByCourse: new ListVideosByCourse(videoRepo),
    requestUploadUrl: new RequestUploadUrl(videoRepo, muxService),
  });
  app.use('/videos', videoRouter);

  const muxRouter = createMuxRouter(muxService, videoRepo);
  app.use('/mux', muxRouter);

  const userRepo = new PgUserRepo(pool);
  const authRouter = createAuthRouter({
    registerUser: new RegisterUser(userRepo),
    loginUser: new LoginUser(userRepo),
    setupTwoFactor: new SetupTwoFactor(userRepo),
    verifyTwoFactor: new VerifyTwoFactor(userRepo),
    refreshToken: new RefreshToken(userRepo),
  });
  app.use('/auth', authRouter);

  setupSwagger(app);

  app.use(errorHandler);

  return app;
}
