/**
 * Snippet Testing Framework
 *
 * A modular, standalone system for testing code snippets in markdown files.
 *
 * Features:
 * - Multi-line directive support
 * - Chainable directives
 * - Complex assertion system
 * - Clear error messages
 * - Fully decoupled and standalone
 *
 * @example
 * ```typescript
 * import { SnippetExtractor, SnippetRunner } from './snippets/index.js'
 * import { readFile } from 'fs/promises'
 *
 * const extractor = new SnippetExtractor()
 * const runner = new SnippetRunner({ showSuccess: true })
 *
 * const snippets = await extractor.extractFromFile(
 *   'README.md',
 *   (path) => readFile(path, 'utf-8')
 * )
 *
 * const results = await runner.runSnippets(snippets, {
 *   globals: { myCustomGlobal: 'value' }
 * })
 *
 * runner.printSummary(results)
 * ```
 */

// Core types
export type {
  CodeSnippet,
  Directive,
  DirectiveArgs,
  ExecutionContext,
  ExecutionResult,
  AssertionResult,
  AssertionFn,
  ReturnAssertion,
  SnippetTestConfig,
  DirectiveHandler,
  SnippetTestResult,
  ModuleResolver,
} from "./types.js"

// Parser
export { DirectiveParser, parseDirectives } from "./parser.js"

// Directives
export type {
  ControlDirective,
  AssertionDirective,
  TransformDirective,
  ConfigDirective,
  CodeTransformation,
  AnyDirective,
  DirectiveDefinition,
  DirectiveExecutionResult,
} from "./directives/types.js"
export {
  directives,
  allDirectives,
  getDirectiveByName,
  skip,
  description,
  expectError,
  expectNoError,
  expectOutput,
  expectOutputRegex,
  expectReturn,
  expectReturnJson,
  awaitDirective,
  timeoutDirective,
  returnStatementDirective,
} from "./directives/index.js"

// Extractor
export {
  SnippetExtractor,
  getDirective,
  getDirectives,
  hasDirective,
  getDirectiveArg,
  getDirectiveArgNumber,
  getDirectiveArgBoolean,
  type ExtractorOptions,
} from "./extractor.js"

// Executor
export {
  SnippetExecutor,
  type ExecutorOptions,
} from "./executor.js"

// Executor modules
export { createMockConsole } from "./executor/console.js"
export { transpileCode, type TranspilerOptions } from "./executor/transpiler.js"
export { transformCode, needsTransformation } from "./executor/transformer.js"
export { executeInSandbox, type SandboxOptions, type SandboxResult } from "./executor/sandbox.js"

// Assertions
export {
  assertIncludes,
  assertEquals,
  assertDeepEquals,
  assertMatches,
  assertJsonPath,
  assertHasProperty,
  assertArrayContains,
  assertArrayLength,
  assertType,
  assertTruthy,
  assertFalsy,
  parseAssertionSpec,
  executeAssertion,
} from "./assertions.js"

// Formatter
export {
  formatTestFailure,
  formatSkipMessage,
  formatSuccessMessage,
  type ErrorFormatOptions,
} from "./formatter.js"

// Runner
export {
  SnippetRunner,
  type RunnerOptions,
} from "./runner.js"

// Plugin system
export {
  PluginManager,
  definePlugin,
  type Plugin,
  type PluginHooks,
} from "./plugin.js"

// Config system
export {
  loadConfig,
  loadJsonConfig,
  loadJsConfig,
  discoverConfigFile,
  mergeConfigs,
  applyDefaults,
  validateConfig,
  DEFAULT_CONFIG,
  CONFIG_FILE_NAMES,
  type SnippetTestFileConfig,
} from "./config.js"

// Example plugins
export {
  loggingPlugin,
  createLoggingPlugin,
  type LoggingPluginOptions,
} from "./examples/logging-plugin.js"
export {
  benchmarkPlugin,
  createBenchmarkPlugin,
  type BenchmarkPluginOptions,
  type BenchmarkResult,
} from "./examples/benchmark-plugin.js"
