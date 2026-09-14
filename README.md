# Backend API Starter Kit

Node.js + Express + TypeScript 기반의 **재사용 가능한 백엔드 API Starter Kit**입니다.
새 API 프로젝트를 시작할 때 폴더를 복사해서 바로 개발을 시작할 수 있도록 최소한의 구조와 설정만 담았습니다.

- Controller / Route / Middleware 역할별 파일 분리
- TypeScript `strict` 모드
- 환경 변수 중앙 관리 (`src/config/env.ts`)
- 공통 404 / 500 에러 응답 처리
- ESLint + Prettier 코드 품질 도구

---

## 기술 스택

| 구분      | 사용 기술                                         |
| --------- | ------------------------------------------------- |
| Runtime   | Node.js (20 이상 권장)                            |
| Framework | Express 5                                         |
| Language  | TypeScript (strict)                               |
| 환경 변수 | dotenv                                            |
| 개발 서버 | tsx (watch 모드 자동 재시작)                      |
| 코드 품질 | ESLint (flat config, typescript-eslint), Prettier |

---

## 프로젝트 구조

```
.
├─ src/
│  ├─ config/
│  │  └─ env.ts                   # 환경 변수 로드 및 검증 (process.env 직접 사용 대신 여기서 import)
│  ├─ controllers/
│  │  └─ health.controller.ts     # 요청 처리 및 응답 생성
│  ├─ routes/
│  │  ├─ index.ts                 # 모든 Router를 모아서 등록 (/api 하위)
│  │  └─ health.route.ts          # URL ↔ Controller 연결
│  ├─ middlewares/
│  │  ├─ error.middleware.ts      # 공통 에러 처리 (500)
│  │  └─ notFound.middleware.ts   # 존재하지 않는 경로 처리 (404)
│  ├─ types/
│  │  └─ api.types.ts             # 공통 응답 타입
│  ├─ utils/                      # 공통 유틸 함수 위치 (현재 비어 있음)
│  ├─ app.ts                      # Express 앱 구성 (미들웨어, Router 등록)
│  └─ server.ts                   # 서버 실행 진입점 (listen)
├─ .env.example                   # 환경 변수 예시 (커밋 대상)
├─ .env                           # 실제 환경 변수 (커밋 제외)
├─ eslint.config.mjs
├─ .prettierrc
├─ tsconfig.json
└─ package.json
```

### 요청 처리 흐름

```
Client 요청
  → app.ts (express.json 등 공통 미들웨어)
  → /api → routes/index.ts
  → /health → routes/health.route.ts
  → controllers/health.controller.ts → 응답
  (매칭되는 Route 없음 → notFound.middleware → 404)
  (처리 중 에러 발생 → error.middleware → 500)
```

---

## 설치 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 파일 생성
cp .env.example .env        # macOS / Linux / Git Bash
copy .env.example .env      # Windows CMD
```

---

## 실행 방법

| 명령어             | 설명                                      |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | 개발 모드 실행 (파일 변경 시 자동 재시작) |
| `npm run build`    | TypeScript → JavaScript 빌드 (`dist/`)    |
| `npm start`        | 빌드된 `dist/server.js` 실행 (운영용)     |
| `npm run lint`     | ESLint 검사                               |
| `npm run lint:fix` | ESLint 자동 수정                          |
| `npm run format`   | Prettier 포맷 적용                        |

```bash
# 개발
npm run dev

# 운영
npm run build
npm start
```

---

## 환경 변수 설정

`.env` 파일에 설정합니다.

```env
PORT=3000
NODE_ENV=development
```

| 변수       | 기본값        | 설명                                      |
| ---------- | ------------- | ----------------------------------------- |
| `PORT`     | `3000`        | 서버 포트 (1~65535가 아니면 시작 시 에러) |
| `NODE_ENV` | `development` | `development` / `production` / `test`     |

코드에서는 `process.env` 대신 `env` 객체를 사용합니다.

```ts
import { env } from './config/env';

console.log(env.port, env.nodeEnv, env.isDevelopment);
```

> 새 환경 변수를 추가할 때는 `.env`, `.env.example`, `src/config/env.ts` 세 곳을 함께 수정하세요.

---

## API 예제

### Health Check

```bash
curl http://localhost:3000/api/health
```

```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-09-14T08:05:32.289Z"
}
```

### 존재하지 않는 API (404)

```bash
curl http://localhost:3000/api/unknown
```

```json
{
  "success": false,
  "message": "Route not found"
}
```

### 서버 에러 (500)

```bash
# 잘못된 JSON Body를 보내 에러 처리 확인
curl -X POST -H "Content-Type: application/json" -d "{bad" http://localhost:3000/api/health
```

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

> 에러 상세 내용(stack)은 응답에 노출되지 않고 서버 콘솔 로그에만 출력됩니다.

---

## 새로운 Router / Controller 추가 방법

예시: `GET /api/users` 추가

### 1. Controller 작성 — `src/controllers/user.controller.ts`

```ts
import { Request, Response } from 'express';
import { ApiResponse } from '../types/api.types';

interface User {
  id: number;
  name: string;
}

// GET /api/users
export const getUsers = async (_req: Request, res: Response<ApiResponse<User[]>>) => {
  const users: User[] = [{ id: 1, name: 'Kim' }];

  res.status(200).json({
    success: true,
    message: 'User list',
    data: users,
  });
};
```

> Express 5에서는 async 함수에서 `throw`된 에러가 자동으로 `error.middleware.ts`로 전달되므로 try/catch를 반복해서 작성할 필요가 없습니다.

### 2. Router 작성 — `src/routes/user.route.ts`

```ts
import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';

const router = Router();

router.get('/', getUsers);

export default router;
```

### 3. Root Router에 등록 — `src/routes/index.ts`

```ts
import userRouter from './user.route';

router.use('/users', userRouter);
```

### 4. 확인

```bash
curl http://localhost:3000/api/users
```

---

## 다른 프로젝트에서 재사용하는 방법

1. 이 폴더를 새 프로젝트 이름으로 복사합니다. (`node_modules`, `dist`, `.env`는 제외)
2. `package.json`의 `name`, `description`, `version`을 수정합니다.
3. `npm install` 실행
4. `.env.example`을 복사해 `.env`를 만들고 값을 설정합니다.
5. `npm run dev`로 `/api/health` 동작을 확인합니다.
6. 위의 "새로운 Router / Controller 추가 방법"대로 기능을 추가합니다.
7. 새 Git 저장소로 시작하려면 `git init` 후 첫 커밋을 합니다.
