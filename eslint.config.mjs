import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    // build-tokens.js is a standalone CommonJS Node script, not part of the
    // Next.js app, so the TypeScript module rules do not apply to it.
    files: ['build-tokens.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'tokens.css', 'next-env.d.ts'],
  },
]

export default config
