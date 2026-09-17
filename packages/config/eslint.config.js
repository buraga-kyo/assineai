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
      'no-console': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/no-v-html': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-useless-assignment': 'off',
      'preserve-caught-error': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-restricted-syntax': 'off'
    },
  },
  { files: ['**/logger.ts', '**/log.ts'], rules: { 'no-console': 'off' } },
  { files: ['**/config.ts'], rules: { 'no-restricted-syntax': 'off' } },
  prettier,
)
