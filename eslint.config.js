import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.astro/**',
      '**/.output/**',
      '**/node_modules/**',
      '**/coverage/**',
      'apps/playground/**',
      '**/pagefind/**',
    ],
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
      // The strict default forbids href="#" placeholders, which appear in
      // component-showcase pages. Still catches anchors with no href at all.
      'astro/jsx-a11y/anchor-is-valid': ['error', { aspects: ['noHref'] }],
      // The rule can't see association when the `for=""` attribute is forwarded
      // via `{...rest}` on a component primitive (e.g. `<Label />`).
      'astro/jsx-a11y/label-has-associated-control': 'off',
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      // Astro pages routinely declare `const { ... } = Astro.props` where some
      // destructured props are forwarded to layout/slot — those reads happen
      // inside the template body, which the parser doesn't always trace.
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['scripts/**/*.{js,mjs,ts}', '**/*.config.{js,mjs,ts}', '**/astro.config.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  }
);
