/**
 * Health Check Controller
 * - 요청을 받아 실제 응답을 만드는 역할만 담당한다. (URL 매핑은 routes에서 처리)
 */
import { Request, Response } from 'express';
import { HealthResponse } from '../types/api.types';

// GET /api/health
export const getHealth = (_req: Request, res: Response<HealthResponse>): void => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
};
