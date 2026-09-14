/**
 * Express 앱 구성
 * - 미들웨어와 Router를 등록한 app 객체를 만든다.
 * - 서버 실행(listen)은 server.ts에서 담당한다. (테스트 시 app만 import 가능)
 */
import express from 'express';
import routes from './routes';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

// 1. 공통 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. API Router
app.use('/api', routes);

// 3. 404 처리 (모든 Router 뒤에 등록)
app.use(notFoundMiddleware);

// 4. 에러 처리 (반드시 가장 마지막에 등록)
app.use(errorMiddleware);

export default app;
