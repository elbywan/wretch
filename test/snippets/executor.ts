/**
 * Executes code snippets in a sandboxed VM environment.
 * Orchestrates transpilation, transformation, and execution.
 */

import ts from "typescript"
import type {
  CodeSnippet,
  ExecutionContext,
  ExecutionResult,
  ModuleResolver
} from "./types.js"
import { getDirectiveArgNumber, hasDirective } from "./extractor.js"
import { createMockConsole } from "./executor/console.js"
import { transpileCode } from "./executor/transpiler.js"
import { transformCode } from "./executor/transformer.js"
import { executeInSandbox } from "./executor/sandbox.js"

export interface ExecutorOptions {
  /** Default timeout in milliseconds */
  defaultTimeout?: number
  /** Module resolver function */
  moduleResolver?: ModuleResolver
  /** Default globals to inject */
  defaultGlobals?: Record<string, unknown>
  /** TypeScript compiler options */
  compilerOptions?: ts.CompilerOptions
}

/**
 * Executes code snippets with proper sandboxing and error handling
 */
export class SnippetExecutor {
  private options: Required<Omit<ExecutorOptions, "moduleResolver" | "defaultGlobals" | "compilerOptions">> & {
    moduleResolver?: ModuleResolver
    defaultGlobals?: Record<string, unknown>
    compilerOptions?: ts.CompilerOptions
  }

  constructor(options: ExecutorOptions = {}) {
    this.options = {
      defaultTimeout: options.defaultTimeout || 5000,
      moduleResolver: options.moduleResolver,
      defaultGlobals: options.defaultGlobals,
      compilerOptions: options.compilerOptions,
    }
  }

  /**
   * Execute a code snippet
   */
  async execute(
    snippet: CodeSnippet,
    context: ExecutionContext = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now()
    const logs: string[] = []

    // Setup console mocking
    const timers = new Map<string, number>()
    const mockConsole = createMockConsole(logs, timers)

    // Merge context globals with defaults
    const globals = {
      ...this.options.defaultGlobals,
      ...context.globals,
      console: context.console || mockConsole,
      __snippetReturnValue: undefined,
    }

    // Get timeout
    const timeout = getDirectiveArgNumber(snippet, "timeout")
      || context.timeout
      || this.options.defaultTimeout

    // Transform code (handle await, return-statement directives)
    const transformedCode = transformCode(snippet)

    // Transpile TypeScript to JavaScript
    const jsCode = transpileCode(transformedCode, snippet.language, {
      compilerOptions: this.options.compilerOptions,
    })

    // Execute in sandbox
    const sandboxResult = await executeInSandbox(jsCode, {
      timeout,
      globals,
      moduleResolver: context.moduleResolver || this.options.moduleResolver,
      identifier: `${snippet.file}:${snippet.line}`,
    })

    // Capture return value if needed
    let returnValue: unknown = undefined
    if (hasDirective(snippet, "expect-return") || hasDirective(snippet, "expect-return-json")) {
      returnValue = sandboxResult.returnValue
    }

    const duration = Date.now() - startTime

    return {
      success: sandboxResult.success,
      error: sandboxResult.error,
      logs,
      returnValue,
      duration,
    }
  }

}
