/**
 * 서버 진입점 (Entry Point)
 * - 환경 변수의 PORT로 서버를 실행한다.
 */
import app from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  console.log(`[SERVER] Running on http://localhost:${env.port} (${env.nodeEnv})`);
});

// 포트 사용 중 등 서버 시작 실패 시 원인을 출력하고 종료한다.
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER] Port ${env.port} is already in use.`);
  } else {
    console.error('[SERVER] Failed to start:', err);
  }
  process.exit(1);
});
