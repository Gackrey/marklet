import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import formatjsPlugin from 'eslint-plugin-formatjs';

const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  {
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react/display-name': 'off',
    },
  },
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: { formatjs: formatjsPlugin },
    rules: {
      'formatjs/no-literal-string-in-jsx': 'error',
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'public/sw.js'],
  },
];

export default eslintConfig;
