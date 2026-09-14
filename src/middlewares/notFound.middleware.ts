/**
 * 404 Not Found Middleware
 * - 등록된 어떤 Router에도 매칭되지 않은 요청을 처리한다.
 * - app.ts에서 모든 Router 등록 "뒤에" 등록해야 한다.
 */
import { Request, Response } from 'express';
import { ApiResponse } from '../types/api.types';

export const notFoundMiddleware = (_req: Request, res: Response<ApiResponse>): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
