// ESLint 설정 (Flat Config)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // 검사 제외 대상
  { ignores: ['dist', 'node_modules'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      // '_'로 시작하는 인자/변수는 사용하지 않아도 허용 (예: _req, _next)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Prettier와 충돌하는 포맷 규칙 비활성화 (항상 마지막에 위치)
  prettierConfig,
);
