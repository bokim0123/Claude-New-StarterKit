/**
 * Health Check Router
 * - URL과 Controller 함수를 연결한다.
 * - routes/index.ts에서 '/health' 경로로 등록된다.
 */
import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router = Router();

// GET /api/health
router.get('/', getHealth);

export default router;
