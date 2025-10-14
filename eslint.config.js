// @ts-check

import eslint from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import tseslint from "typescript-eslint"
import globals from "globals"

export default defineConfig([
  globalIgnores([
    "./dist/*",
    "./test/generated/*",
  ]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      indent: ["error", 2],
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double"],
      semi: ["error", "never"],
      "no-console": "warn",
      "arrow-parens": ["error", "as-needed"],
      "no-var": "error",
      "prefer-const": "error",
      "object-curly-spacing": ["error", "always"],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
  },
  {
    files: ["test/browser/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.mocha,
        wretch: "readonly",
        expect: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "no-empty": "off"
    }
  }
])
