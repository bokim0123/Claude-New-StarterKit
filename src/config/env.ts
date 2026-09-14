/**
 * 환경 변수 관리
 * - .env 파일을 읽어 타입이 지정된 env 객체로 제공한다.
 * - 다른 파일에서는 process.env를 직접 사용하지 말고 이 파일의 env를 import 한다.
 */
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

type NodeEnv = 'development' | 'production' | 'test';

// PORT 값을 숫자로 변환하고, 잘못된 값이면 서버 시작 시점에 바로 에러를 발생시킨다.
function parsePort(value: string | undefined, defaultPort: number): number {
  if (value === undefined || value === '') {
    return defaultPort;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: "${value}"`);
  }
  return port;
}

// NODE_ENV 값이 허용된 값이 아니면 development로 처리한다.
function parseNodeEnv(value: string | undefined): NodeEnv {
  if (value === 'production' || value === 'test') {
    return value;
  }
  return 'development';
}

const nodeEnv = parseNodeEnv(process.env.NODE_ENV);

export const env = {
  port: parsePort(process.env.PORT, 3000),
  nodeEnv,
  isDevelopment: nodeEnv === 'development',
} as const;
