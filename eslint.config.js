import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        // Regras com informação de tipo, usando os tsconfig do projeto
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // contextos exportam o Provider e o hook juntos
      'react-refresh/only-export-components': ['error', {
        allowConstantExport: true,
        allowExportNames: ['useNotifications', 'useLancamentos', 'useTheme', 'usePreferencias'],
      }],
    },
  },
  {
    // Arquivos de configuração que continuam em JS (ex.: este arquivo)
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
  },
])
