# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

새 백엔드 API 프로젝트를 시작할 때 복사해서 쓰는 **재사용용 Starter Kit** (Node.js + Express 5 + TypeScript).
초보자도 이해하기 쉬운 단순한 구조를 유지하는 것이 목적이므로, 불필요한 추상화·패턴·라이브러리를 추가하지 않는다.
**백엔드 전용** 저장소다 (Next.js / React 등 프런트엔드 런타임 없음). Node.js >= 20 (`package.json`의 `engines`).

## 명령어

```bash
npm install                # 최초 1회
cp .env.example .env       # 최초 1회 (.env는 커밋 대상 아님)

npm run dev        # tsx watch src/server.ts (파일 변경 시 자동 재시작)
npm run build      # tsc → dist/
npm start          # node dist/server.js (build 선행 필요)
npm run lint       # eslint .
npm run lint:fix
npm run format     # prettier --write .
npx prettier --check .
```

- 테스트 프레임워크는 아직 없다. 변경 후 검증은 `npm run build` + `npm run lint` + `npx prettier --check .` 통과, 그리고 서버를 띄워 `GET /api/health`(200), `GET /api/unknown`(404), 잘못된 JSON body로 `POST /api/health`(500)를 확인한다.
- **Prettier 검사 대상에 문서도 포함된다**: `.prettierignore`가 제외하는 것은 `node_modules`, `dist`, `package-lock.json`뿐이므로 `CLAUDE.md`, `README.md`, `.claude/**/*.md`를 수정해도 `npx prettier --check .`가 깨질 수 있다.
- 개발 PC의 3000번 포트를 다른 서버가 쓰고 있을 수 있다. 수동 확인 시 `PORT` 환경 변수로 다른 포트를 지정한다 (dotenv는 이미 설정된 환경 변수를 덮어쓰지 않음).
- 검증용 서버는 `npm run dev`(tsx watch)보다 `PORT=3157 node dist/server.js`가 편하다. watch 프로세스는 종료가 번거롭다. Windows에서는 `kill` 후 `taskkill //PID <pid> //F`까지 해야 확실히 종료된다.

## 이 저장소의 Claude Code 자산

- **`code-reviewer` 에이전트** — 읽기 전용 코드 리뷰 (버그, 응답 계약 위반, 미들웨어 순서, Convention 위반)
- **`api-verify-runner` 에이전트** — 위 검증 절차 전체를 실행하고 서버 프로세스까지 정리한다. 수동으로 스크립트를 짜기 전에 이 에이전트를 먼저 고려한다.
- **`/add-component` 커맨드** — `src/components/`에 React 컴포넌트를 생성한다 ("설정상 주의점" 참고).
- **`docs/`** — 리뷰 결과 등 산출물 문서를 날짜가 들어간 파일명으로 보관한다 (예: `docs/code-review-2026-09-15.md`).
- **`.mcp.json`** — 프로젝트 MCP 서버: `context7`(라이브러리 문서), `playwright`(브라우저), `sequential-thinking`, `shadcn`.
- `.claude/settings.local.json`, `.claude/notify.ps1`, `.claude/verify-on-stop.ps1`은 `.gitignore` 대상인 개인 설정(권한, Windows 전용 hook)이다. 커밋하지 않는다.
  - `notify.ps1`은 Notification / Stop 시 Windows 토스트 알림을 띄우고 `.claude/logs/notify-yyyyMMdd.log`에 기록한다 (`logs/`도 `.gitignore` 대상). `settings.local.json`에서 등록하며 항상 exit 0으로 끝난다.
  - `verify-on-stop.ps1`은 파일만 있고 현재 `settings.local.json`에 hook으로 등록되어 있지 않다.

## 아키텍처

요청 흐름: `server.ts`(listen) → `app.ts` → `/api` → `routes/index.ts` → 기능별 `*.route.ts` → `controllers/*.controller.ts`

- **app.ts / server.ts 분리**: `app.ts`는 app 구성만 하고 export, `listen`은 `server.ts`에서만 한다 (테스트에서 app만 import 가능하도록).
- **미들웨어 등록 순서가 동작을 결정한다** (`app.ts`): 공통 미들웨어 → `/api` Router → `notFoundMiddleware` → `errorMiddleware`(반드시 마지막, 4-인자 시그니처 유지).
- **Route / Controller 역할 분리**: Route 파일은 URL ↔ 함수 연결만, 응답 생성은 Controller에서. 새 기능은 `xxx.controller.ts` → `xxx.route.ts` → `routes/index.ts`에 `router.use('/xxx', xxxRouter)` 등록.
  - 이 3단계의 전체 예제 코드는 `README.md`의 "새로운 Router / Controller 추가 방법"에 있다. 여기에 중복 작성하지 말고 README를 참조한다.
- **Express 5**: async 핸들러에서 throw된 에러가 자동으로 `errorMiddleware`로 전달되므로 asyncHandler 래퍼나 반복 try/catch를 만들지 않는다.
- **에러 응답 계약**: 404 → `{ success: false, message: "Route not found" }`, 모든 에러 → 500 `{ success: false, message: "Internal Server Error" }` (상세/stack은 서버 콘솔에만, development일 때만 stack 출력). 응답 형식은 과제 요구사항이므로 임의 변경 금지.
- **응답 계약은 타입으로 보호되지 않는다**: `ApiResponse.message`가 `string`이므로 `'Route not found'`를 다른 문자열로 바꿔도 build / lint / prettier가 전부 통과한다. 계약 파괴는 **실제 HTTP 응답 본문 대조**로만 잡히므로, 응답 관련 코드를 만졌으면 검증을 건너뛰지 않는다.
- **응답 타입**: `src/types/api.types.ts`의 `ApiResponse<T>`를 `Response<...>` 제네릭으로 사용해 응답 형태를 타입으로 강제한다. 추가 필드가 필요하면 `HealthResponse extends ApiResponse`처럼 확장 인터페이스를 만든다.
- **환경 변수**: `process.env`를 직접 읽지 말고 `src/config/env.ts`의 `env` 객체(`port`, `nodeEnv`, `isDevelopment`)를 import. 새 변수 추가 시 `.env`, `.env.example`, `env.ts` 세 곳을 함께 수정.
- **기동 실패 경로가 두 개 있다**: `env.ts`의 `parsePort`는 PORT가 1~65535 정수가 아니면 throw하고(모듈 로드 시점), `parseNodeEnv`는 허용값(`development`/`production`/`test`) 외 값을 조용히 `development`로 처리한다. `server.ts`는 `EADDRINUSE`를 구분해 로그를 남기고 `process.exit(1)` 한다. 검증 중 서버가 즉시 죽으면 이 두 경로를 먼저 확인한다.

## 설정상 주의점

- **TypeScript 6 + `module: nodenext`**, `package.json`에 `"type"` 없음 → CommonJS로 출력되며 상대 import에 `.js` 확장자를 붙이지 않는다. `"type": "module"`을 추가하면 모든 import 경로가 깨지므로 주의.
- `tsconfig`에 `noUnusedLocals`/`noUnusedParameters`가 켜져 있다. 사용하지 않는 인자는 `_` 접두사(`_req`, `_next`)로 표기하며 ESLint도 이를 허용하도록 설정됨. `noImplicitReturns`/`noFallthroughCasesInSwitch`도 켜져 있다.
- ESLint 10 flat config(`eslint.config.mjs`), `eslint-config-prettier`는 항상 마지막에 둔다.
- Prettier 설정(`.prettierrc`): `singleQuote`, `semi`, `trailingComma: "all"`, `printWidth: 100`, `tabWidth: 2`, `endOfLine: "auto"`. 새 코드는 처음부터 이 스타일로 작성한다.
- **`src/components/*.tsx`는 현재 빌드되지 않는다**: `tsconfig`의 `include`가 `src/**/*.ts`이고 `jsx` 옵션도 `react` 의존성도 없으며 `types`가 `["node"]`로 제한되어 DOM 타입도 없다. 이 저장소는 백엔드 전용이며 `/add-component`로 만든 컴포넌트는 참고용 산출물이다. `npm run build`가 통과하더라도 컴파일된 것이 아니다. 실제로 쓰려면 `react`·`@types/react` 설치와 `jsx`·`include`·`types` 설정 변경이 함께 필요하다.
- `src/utils/`는 `.gitkeep`만 있는 빈 디렉터리다. 공통 유틸이 생기면 여기에 둔다.
- 코드 주석·문서·커밋 메시지는 한국어, 각 파일 상단에 역할 설명 주석을 둔다.
- 커밋 메시지는 `대상 + 동작: 이름` 명사형 종결 + 필요 시 불릿 본문. Conventional Commits는 쓰지 않는다. 예: `검증 실행 서브에이전트 추가: api-verify-runner`
