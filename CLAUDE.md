# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

새 백엔드 API 프로젝트를 시작할 때 복사해서 쓰는 **재사용용 Starter Kit** (Node.js + Express 5 + TypeScript).
초보자도 이해하기 쉬운 단순한 구조를 유지하는 것이 목적이므로, 불필요한 추상화·패턴·라이브러리를 추가하지 않는다.

## 명령어

```bash
npm run dev        # tsx watch src/server.ts (파일 변경 시 자동 재시작)
npm run build      # tsc → dist/
npm start          # node dist/server.js
npm run lint       # eslint .
npm run lint:fix
npm run format     # prettier --write .
npx prettier --check .
```

- 테스트 프레임워크는 아직 없다. 변경 후 검증은 `npm run build` + `npm run lint` + `npx prettier --check .` 통과, 그리고 서버를 띄워 `GET /api/health`(200), `GET /api/unknown`(404), 잘못된 JSON body로 `POST /api/health`(500)를 확인한다.
- 개발 PC의 3000번 포트를 다른 서버가 쓰고 있을 수 있다. 수동 확인 시 `PORT` 환경 변수로 다른 포트를 지정한다 (dotenv는 이미 설정된 환경 변수를 덮어쓰지 않음).

## 아키텍처

요청 흐름: `server.ts`(listen) → `app.ts` → `/api` → `routes/index.ts` → 기능별 `*.route.ts` → `controllers/*.controller.ts`

- **app.ts / server.ts 분리**: `app.ts`는 app 구성만 하고 export, `listen`은 `server.ts`에서만 한다 (테스트에서 app만 import 가능하도록).
- **미들웨어 등록 순서가 동작을 결정한다** (`app.ts`): 공통 미들웨어 → `/api` Router → `notFoundMiddleware` → `errorMiddleware`(반드시 마지막, 4-인자 시그니처 유지).
- **Route / Controller 역할 분리**: Route 파일은 URL ↔ 함수 연결만, 응답 생성은 Controller에서. 새 기능은 `xxx.controller.ts` → `xxx.route.ts` → `routes/index.ts`에 `router.use('/xxx', xxxRouter)` 등록.
- **Express 5**: async 핸들러에서 throw된 에러가 자동으로 `errorMiddleware`로 전달되므로 asyncHandler 래퍼나 반복 try/catch를 만들지 않는다.
- **에러 응답 계약**: 404 → `{ success: false, message: "Route not found" }`, 모든 에러 → 500 `{ success: false, message: "Internal Server Error" }` (상세/stack은 서버 콘솔에만, development일 때만 stack 출력). 응답 형식은 과제 요구사항이므로 임의 변경 금지.
- **응답 타입**: `src/types/api.types.ts`의 `ApiResponse<T>`를 `Response<...>` 제네릭으로 사용해 응답 형태를 타입으로 강제한다.
- **환경 변수**: `process.env`를 직접 읽지 말고 `src/config/env.ts`의 `env` 객체(`port`, `nodeEnv`, `isDevelopment`)를 import. 새 변수 추가 시 `.env`, `.env.example`, `env.ts` 세 곳을 함께 수정.

## 설정상 주의점

- **TypeScript 6 + `module: nodenext`**, `package.json`에 `"type"` 없음 → CommonJS로 출력되며 상대 import에 `.js` 확장자를 붙이지 않는다. `"type": "module"`을 추가하면 모든 import 경로가 깨지므로 주의.
- `tsconfig`에 `noUnusedLocals`/`noUnusedParameters`가 켜져 있다. 사용하지 않는 인자는 `_` 접두사(`_req`, `_next`)로 표기하며 ESLint도 이를 허용하도록 설정됨.
- ESLint 9+ flat config(`eslint.config.mjs`), `eslint-config-prettier`는 항상 마지막에 둔다.
- 코드 주석·문서·커밋 메시지는 한국어, 각 파일 상단에 역할 설명 주석을 둔다.
