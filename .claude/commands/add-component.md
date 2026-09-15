---
description: src/components/에 React + TypeScript + Tailwind 함수형 컴포넌트를 생성합니다
argument-hint: <ComponentName>
allowed-tools: Read, Glob, Grep, Write
---

컴포넌트 이름: `$1`

아래 순서대로 진행한다.

## 1. 인자 검증

- `$1`이 비어 있으면 파일을 생성하지 말고 사용법(`/add-component UserCard`)을 안내한 뒤 종료한다.
- `$1`이 PascalCase가 아니면(예: `userCard`, `user-card`) PascalCase 변환안을 제시하고 사용자 확인 후 진행한다.
- `src/components/$1.tsx`가 이미 존재하면 덮어쓰지 말고 사용자에게 알린 뒤 종료한다.

## 2. 기존 프로젝트 확인 (생성 전 필수)

- `package.json`: `react`, `@types/react`, `tailwindcss` 설치 여부
- `tsconfig.json`: `jsx` 옵션 설정 여부, `include`에 `.tsx`가 포함되는지
- `src/components/`에 기존 컴포넌트가 있으면 그 스타일(export 방식, 파일/폴더 구조, props 네이밍, import 순서, 주석 형식)을 **우선** 따른다.
- `.prettierrc`, `eslint.config.mjs` 규칙(세미콜론, 따옴표, 들여쓰기, printWidth 등)을 확인해 맞춘다.
- React가 설치되어 있지 않으면 **파일 생성 전에** 사용자에게 알리고 계속할지 확인한다.
  - 의존성 설치(`npm install`)나 설정 파일(`tsconfig.json`, `package.json` 등) 수정은 하지 않는다.
  - 필요한 작업 항목만 안내한다.

## 3. 컴포넌트 작성 규칙

- 파일 위치: `src/components/$1.tsx` (기존 컴포넌트가 폴더 단위 구조라면 그 구조를 따른다)
- 파일 상단에 한국어로 컴포넌트 역할 설명 주석을 둔다.
- 함수형 컴포넌트로 작성한다.
- props가 필요한 경우 `interface $1Props`로 정의한다. props가 필요 없으면 interface를 생략한다.
- 스타일은 Tailwind CSS `className`만 사용하고 별도 CSS 파일은 만들지 않는다.
- 기존 컴포넌트가 없으면 named export를 사용한다.
- 불필요한 상태, 훅, 외부 라이브러리를 추가하지 않는다.

기존 스타일이 없을 때의 기본 템플릿:

```tsx
/**
 * $1 컴포넌트
 * - (컴포넌트 역할 설명)
 */
interface $1Props {
  title: string;
}

export const $1 = ({ title }: $1Props) => {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
};
```

## 4. 완료 보고

다음 내용을 한국어로 간단히 보고한다.

- 생성한 파일 경로
- 확인한 프로젝트 스타일 요약 (어떤 규칙을 따랐는지)
- React / Tailwind 미설치, `tsconfig` 설정 등 추가로 필요한 작업이 있으면 안내
