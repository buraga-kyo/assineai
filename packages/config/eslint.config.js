import js from '@eslint/js'
import prettier from 'eslint-config-prettier/flat'
import vue from 'eslint-plugin-vue'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// process.env lido direto, fora do config.ts
const processEnv = "MemberExpression[object.name='process'][property.name='env']"

export default defineConfig(
  globalIgnores(['legado/**', 'design/**', 'infra/**', 'docs/**', '**/dist/**', '**/coverage/**']),
  js.configs.recommended,
  tseslint.configs.recommended,
  vue.configs['flat/recommended'],
  { languageOptions: { globals: { ...globals.node } } },
  {
    files: ['apps/web/**', 'packages/ui/**'],
    languageOptions: { globals: { ...globals.browser } },
  },
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  {
    rules: {
      'no-console': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: processEnv, message: 'process.env só pode ser lido em config.ts' },
      ],
    },
  },
  { files: ['**/logger.ts', '**/log.ts'], rules: { 'no-console': 'off' } },
  { files: ['**/config.ts'], rules: { 'no-restricted-syntax': 'off' } },
  prettier,
)
