# 코드 리뷰 결과 (2026-09-15)

`code-reviewer` 서브에이전트로 저장소 전체를 읽기 전용으로 리뷰한 결과이다.
정적 분석으로 확인하지 못한 항목(lint 결과, `.env` 커밋 이력)은 명령을 직접 실행해 확인했다.

## 리뷰 범위

- `src/app.ts`, `src/server.ts`, `src/config/env.ts`
- `src/routes/index.ts`, `src/routes/health.route.ts`
- `src/controllers/health.controller.ts`
- `src/middlewares/error.middleware.ts`, `src/middlewares/notFound.middleware.ts`
- `src/types/api.types.ts`
- `src/components/ButtonAce.tsx`
- 설정 파일: `package.json`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `.gitignore`, `.env.example`
- 제외: `node_modules`, `dist`

## 요약

- 심각도 높음: 없음
- 심각도 중간: 1건 (`src/components/ButtonAce.tsx`)
- 심각도 낮음: 1건 (`.env` 커밋 이력, 확인 결과 해소)

## 발견 사항

### [중간] 이 프로젝트와 맞지 않는 React 컴포넌트 파일이 있음

- **위치:** `src/components/ButtonAce.tsx`
- **확인된 사실:**
  - 이 파일은 Git에 커밋되어 있다.
  - `package.json`에 react 의존성이 없고, `tsconfig.json`에 `jsx` 옵션도 없다.
  - `tsconfig`의 `include`가 `src/**/*.ts`라서 `npm run build`에는 포함되지 않는다.
  - `npm run lint`는 에러 없이 통과한다. 지금 lint나 빌드에는 문제가 없다.
- **문제:** 이 저장소는 백엔드 API를 새로 시작할 때 복사해 쓰는 Starter Kit이다. 복사해서 쓰는 사람이 React 프로젝트로 오해할 수 있다.
- **추정:** `d356f68 커스텀 커맨드 추가: [ButtonAce]` 커밋에서 커맨드를 테스트하다 남은 파일로 보인다.
- **수정 제안:** `src/components/` 폴더를 파일과 함께 삭제한다. `add-component` 커스텀 커맨드 실습용으로 일부러 남긴 파일이라면 유지하고, README에 용도를 적어 둔다.
- **처리 상태:** 미처리 (삭제 여부 결정 필요)

### [낮음] `.env` 커밋 이력 → 해소

- `git log --all --full-history -- .env` 결과가 비어 있어 과거에 커밋된 적이 없다.
- `.gitignore`도 `.env`는 제외하고 `.env.example`만 추적하도록 올바르게 설정되어 있다.

## 확인 완료 (문제 없음)

| 항목                | 결과                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- |
| 미들웨어 순서       | `json/urlencoded` → `/api` → `notFound` → `error` 순서 (`src/app.ts`)                     |
| app/server 분리     | `listen`은 `src/server.ts`에서만 호출                                                     |
| 에러 미들웨어       | 인자 4개 형태 유지, 안 쓰는 인자는 `_` 접두사                                             |
| 응답 형식           | 404 / 500 응답 형식이 문서와 일치하고, stack은 development일 때만 콘솔에 출력             |
| Express 5 에러 전달 | 불필요한 `asyncHandler`나 `try/catch` 없음. 잘못된 JSON 에러도 `errorMiddleware`로 전달됨 |
| Route/Controller    | `health.route.ts`는 URL 연결만, 응답은 Controller에서 생성                                |
| `ApiResponse<T>`    | Controller와 미들웨어 모두 `Response<...>` 제네릭 사용                                    |
| 환경 변수           | `process.env`는 `env.ts`에서만 읽음. `.env` / `.env.example` / `env.ts` 변수 일치         |
| import 규칙         | `"type"` 필드 없음, 상대 경로에 `.js` 확장자 안 붙임                                      |
| ESLint              | `eslint-config-prettier`가 마지막에 있고, `_` 접두사 인자 허용                            |
| 파일 상단 주석      | 모든 `.ts` 파일에 한국어 역할 설명 주석 있음                                              |
| 추상화              | 불필요한 패턴이나 wrapper 없음                                                            |

## 추가 개선 제안 (바로 적용할 필요는 없음)

- 지금 Controller는 `health` 하나뿐이라 `ApiResponse<T>`의 `data` 필드를 실제로 채워 쓰는 예시가 없다. 기능을 추가할 때 그런 예시를 하나 두면 다른 사람이 따라 하기 쉽다.

## 검증 방법

- `npm run build`, `npm run lint`, `npx prettier --check .`
- 서버를 띄운 뒤 다음 요청의 응답 코드와 내용 확인
  - `GET /api/health` → 200
  - `GET /api/unknown` → 404 `{ success: false, message: "Route not found" }`
  - 잘못된 JSON으로 `POST /api/health` → 500 `{ success: false, message: "Internal Server Error" }`
- `PORT=abc`나 `PORT=0`으로 서버를 띄웠을 때 `parsePort`가 바로 에러를 내는지 확인
