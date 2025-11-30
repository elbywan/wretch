/**
 * Code transpilation utilities
 */

import ts from "typescript"

export interface TranspilerOptions {
  /** TypeScript compiler options */
  compilerOptions?: ts.CompilerOptions
}

/**
 * Default TypeScript compiler options
 */
const DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
}

/**
 * Transpile code to JavaScript
 */
export function transpileCode(code: string, language: string, options: TranspilerOptions = {}): string {
  // Only transpile TypeScript
  if (language === "ts" || language === "typescript") {
    const compilerOptions = options.compilerOptions || DEFAULT_COMPILER_OPTIONS

    return ts.transpile(code, compilerOptions)
  }

  return code
}
