/**
 * 공통 Error Middleware
 * - Controller 또는 다른 Middleware에서 발생한 에러를 한 곳에서 처리한다.
 * - Express 5는 async 함수에서 throw된 에러도 자동으로 여기로 전달한다.
 * - 인자가 4개(err, req, res, next)여야 Express가 에러 핸들러로 인식한다.
 * - app.ts에서 가장 "마지막"에 등록해야 한다.
 */
import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../types/api.types';

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response<ApiResponse>,
  // 사용하지 않더라도 Express가 에러 핸들러로 인식하려면 4번째 인자가 필요하다.
  _next: NextFunction,
): void => {
  // 원인 추적을 위해 서버 로그에는 상세 정보를 남긴다. (클라이언트 응답에는 노출하지 않음)
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [ERROR] ${req.method} ${req.originalUrl}`);
  if (env.isDevelopment && err instanceof Error) {
    console.error(err.stack);
  } else {
    console.error(err instanceof Error ? err.message : err);
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
