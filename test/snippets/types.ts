/**
 * Core types for the snippet testing system.
 * This file has no external dependencies and can be used standalone.
 */

/**
 * Represents a directive parsed from markdown comments
 */
export interface Directive {
  /** The directive name (e.g., "skip", "await", "expect-return") */
  name: string
  /** The directive arguments/parameters */
  args: DirectiveArgs
  /** The line number where the directive was found */
  line: number
}

/**
 * Directive arguments - can be a single value or multiple named parameters
 */
export type DirectiveArgs =
  | string
  | number
  | boolean
  | RegExp
  | Record<string, string | number | boolean | RegExp>
  | (string | number | boolean | RegExp)[]

/**
 * A code snippet extracted from markdown
 */
export interface CodeSnippet {
  /** The source code */
  code: string
  /** The programming language */
  language: string
  /** The source file path */
  file: string
  /** The line number where the snippet starts (1-based) */
  line: number
  /** The snippet index within the file (0-based) */
  index: number
  /** All directives attached to this snippet */
  directives: Directive[]
}

/**
 * Context for executing a code snippet
 */
export interface ExecutionContext {
  /** Global variables to inject into the execution environment */
  globals?: Record<string, unknown>
  /** Console implementation (can be mocked) */
  console?: Console
  /** Timeout in milliseconds */
  timeout?: number
  /** Module resolver function */
  moduleResolver?: ModuleResolver
}

/**
 * Result of executing a snippet
 */
export interface ExecutionResult {
  /** Whether the snippet executed successfully */
  success: boolean
  /** Error thrown during execution, if any */
  error?: Error
  /** Console output captured during execution */
  logs: string[]
  /** Return value from the snippet */
  returnValue?: unknown
  /** Execution time in milliseconds */
  duration: number
}

/**
 * Function to resolve module imports
 */
export type ModuleResolver = (specifier: string) => Promise<unknown>

/**
 * Assertion result
 */
export interface AssertionResult {
  /** Whether the assertion passed */
  passed: boolean
  /** Error message if the assertion failed */
  message?: string
  /** The actual value that was checked */
  actual?: unknown
  /** The expected value */
  expected?: unknown
}

/**
 * An assertion function
 */
export type AssertionFn = (actual: unknown, expected: unknown) => AssertionResult

/**
 * Assertion type for expect-return directive
 */
export type ReturnAssertion =
  | { type: "includes"; value: string }
  | { type: "equals"; value: unknown }
  | { type: "matches"; value: RegExp }
  | { type: "custom"; fn: AssertionFn }
  | { type: "json-path"; path: string; value: unknown }
  | { type: "deep-equals"; value: unknown }

/**
 * Configuration for the snippet testing system
 */
export interface SnippetTestConfig {
  /** Files to extract snippets from */
  files: string[]
  /** Base directory for resolving relative paths */
  baseDir?: string
  /** Default execution timeout in milliseconds */
  timeout?: number
  /** Default execution context */
  executionContext?: ExecutionContext
  /** Custom directive handlers */
  customDirectives?: Record<string, DirectiveHandler>
  /** Whether to skip snippets without directives */
  skipUndirected?: boolean
  /** Custom skip predicate */
  shouldSkip?: (snippet: CodeSnippet) => { skip: boolean; reason?: string }
}

/**
 * Handler for custom directives
 */
export type DirectiveHandler = (
  snippet: CodeSnippet,
  directive: Directive,
  context: ExecutionContext
) => void | Promise<void>

/**
 * Test result for a snippet
 */
export interface SnippetTestResult {
  /** The snippet that was tested */
  snippet: CodeSnippet
  /** Whether the test passed */
  passed: boolean
  /** Whether the test was skipped */
  skipped: boolean
  /** Skip reason if applicable */
  skipReason?: string
  /** Error that occurred during testing */
  error?: Error
  /** Execution result */
  executionResult?: ExecutionResult
  /** Assertion results */
  assertions: AssertionResult[]
}
