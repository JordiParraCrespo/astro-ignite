import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', '.astro/**', '.output/**', 'node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'astro/jsx-a11y/anchor-is-valid': ['error', { aspects: ['noHref'] }],
      'astro/jsx-a11y/label-has-associated-control': 'off',
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // Tailwind v4 canonical-class hardening. ESLint runs per-package
    // (`eslint src`), so `entryPoint` resolves against this package's own
    // `src/styles/global.css`, where the `@theme` tokens live. All Tailwind
    // class strings live in `.astro` files.
    files: ['**/*.astro'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/global.css',
      },
    },
    rules: {
      // `text-[length:var(--ig-sans-size)]` -> `text-(length:--ig-sans-size)`
      'better-tailwindcss/enforce-consistent-variable-syntax': 'error',
      // canonical class order so diffs stay clean
      'better-tailwindcss/enforce-consistent-class-order': 'error',
      // collapse `class=" foo  bar "` -> `class="foo bar"`
      'better-tailwindcss/no-unnecessary-whitespace': 'error',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['**/*.config.{js,mjs,ts}', '**/astro.config.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  }
);
