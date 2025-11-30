/**
 * Types for directive system
 */

import type { CodeSnippet, Directive, AssertionResult, ExecutionContext } from "../types.js"

/**
 * Execution result passed to directive handlers
 */
export interface DirectiveExecutionResult {
  success: boolean
  error?: Error
  logs: string[]
  returnValue?: unknown
}

/**
 * Code transformation result
 */
export interface CodeTransformation {
  /** The transformed code */
  code: string
  /** Whether code was modified */
  modified: boolean
}

/**
 * Base directive definition
 */
export interface DirectiveDefinition<THandler = any> {
  /** The directive name (without "snippet:" prefix) */
  name: string
  /** The handler function */
  handler: THandler
  /** Description for documentation */
  description?: string
}

/**
 * Control directive - handles skip logic and test metadata
 */
export interface ControlDirective extends DirectiveDefinition<
  (snippet: CodeSnippet, directive: Directive) => { skip: boolean; reason?: string } | null
> {
  type: "control"
}

/**
 * Assertion directive - validates execution results
 */
export interface AssertionDirective extends DirectiveDefinition<
  (executionResult: DirectiveExecutionResult, directive: Directive) => AssertionResult
> {
  type: "assertion"
}

/**
 * Transform directive - modifies code before execution
 * Examples: await wrapping, return statement injection
 */
export interface TransformDirective extends DirectiveDefinition<
  (snippet: CodeSnippet, directive: Directive) => CodeTransformation
> {
  type: "transform"
}

/**
 * Config directive - modifies execution configuration
 * Examples: timeout, module resolution
 */
export interface ConfigDirective extends DirectiveDefinition<
  (snippet: CodeSnippet, directive: Directive, context: ExecutionContext) => Partial<ExecutionContext>
> {
  type: "config"
}

/**
 * Union of all directive types
 */
export type AnyDirective = ControlDirective | AssertionDirective | TransformDirective | ConfigDirective
