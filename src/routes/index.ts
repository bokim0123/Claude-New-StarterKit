/**
 * Root Router
 * - 모든 기능별 Router를 한 곳에서 등록한다.
 * - app.ts에서 '/api' 경로로 연결되므로, 여기서 '/health'는 최종적으로 '/api/health'가 된다.
 */
import { Router } from 'express';
import healthRouter from './health.route';

const router = Router();

router.use('/health', healthRouter);
// 새로운 Router는 아래에 추가한다.
// router.use('/users', userRouter);

export default router;
