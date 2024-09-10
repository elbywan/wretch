// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import globals from "globals"

delete globals.browser["AudioWorkletGlobalScope "]

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
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
        ...globals.browser,
        "AudioWorkletGlobalScope": false
      }
    },
    ignores: ["node_modules", "dist"],
  }
)
