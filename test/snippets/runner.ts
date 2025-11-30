
/**
 * Main orchestrator for snippet testing.
 * Coordinates extraction, execution, assertion, and reporting.
 */

import type {
  CodeSnippet,
  SnippetTestResult,
  ExecutionContext,
  AssertionResult,
} from "./types.js"
import { getDirective, getDirectives } from "./extractor.js"
import { SnippetExecutor, type ExecutorOptions } from "./executor.js"
import { formatTestFailure, formatSkipMessage, formatSuccessMessage } from "./formatter.js"
import { getDirectiveByName } from "./directives/index.js"
import { PluginManager, type Plugin } from "./plugin.js"

export interface RunnerOptions extends ExecutorOptions {
  /** Custom skip predicate */
  shouldSkip?: (snippet: CodeSnippet) => { skip: boolean; reason?: string }
  /** Show success messages */
  showSuccess?: boolean
  /** Show skip messages */
  showSkipped?: boolean
  /** Verbose output */
  verbose?: boolean
  /** Plugins to load */
  plugins?: Plugin[]
}

/**
 * Main runner for snippet tests
 */
export class SnippetRunner {
  private executor: SnippetExecutor
  private options: RunnerOptions
  private pluginManager: PluginManager

  constructor(options: RunnerOptions = {}) {
    this.options = options
    this.executor = new SnippetExecutor(options)
    this.pluginManager = new PluginManager()
  }

  /**
   * Initialize the runner (loads plugins and calls onInit hooks)
   */
  async initialize(): Promise<void> {
    // Load plugins if provided
    if (this.options.plugins) {
      for (const plugin of this.options.plugins) {
        await this.pluginManager.register(plugin)
      }
    }

    // Call onInit hooks
    await this.pluginManager.callHook("onInit")
  }

  /**
   * Get the plugin manager instance
   */
  getPluginManager(): PluginManager {
    return this.pluginManager
  }

  /**
   * Run tests for all snippets
   */
  async runSnippets(
    snippets: CodeSnippet[],
    context: ExecutionContext = {}
  ): Promise<SnippetTestResult[]> {
    const results: SnippetTestResult[] = []

    for (const snippet of snippets) {
      const result = await this.runSnippet(snippet, context)
      results.push(result)
    }

    // Call onComplete hook
    await this.pluginManager.callHook("onComplete", results)

    return results
  }

  /**
   * Run a single snippet test
   */
  async runSnippet(
    snippet: CodeSnippet,
    context: ExecutionContext = {}
  ): Promise<SnippetTestResult> {
    try {
      // Check if should skip
      const skipCheck = this.shouldSkipSnippet(snippet)
      if (skipCheck.skip) {
        const result: SnippetTestResult = {
          snippet,
          passed: false,
          skipped: true,
          skipReason: skipCheck.reason,
          assertions: [],
        }
        // Call onTestComplete hook for skipped tests too
        const modifiedResults = await this.pluginManager.callHook("onTestComplete", result)
        return modifiedResults.find(r => r !== undefined) ?? result
      }

      // Call onBeforeRun hook
      const beforeRunResults = await this.pluginManager.callHook("onBeforeRun", snippet, context)

      // Check if any plugin wants to skip
      for (const result of beforeRunResults) {
        if (result === false) {
          const skipResult: SnippetTestResult = {
            snippet,
            passed: false,
            skipped: true,
            skipReason: "Skipped by plugin",
            assertions: [],
          }
          const modifiedResults = await this.pluginManager.callHook("onTestComplete", skipResult)
          return modifiedResults.find(r => r !== undefined) ?? skipResult
        }
        // Allow plugins to modify context
        if (result && typeof result === "object") {
          Object.assign(context, result)
        }
      }

      // Execute snippet
      let executionResult = await this.executor.execute(snippet, context)

      // Call onAfterRun hook
      const afterRunResults = await this.pluginManager.callHook("onAfterRun", snippet, executionResult)
      // Allow plugins to modify execution result
      const modifiedExecResult = afterRunResults.find(r => r !== undefined)
      if (modifiedExecResult) {
        executionResult = modifiedExecResult
      }

      // Run assertions
      const assertions = await this.runAssertions(snippet, executionResult)

      // Determine if test passed
      const passed = this.determineTestSuccess(snippet, executionResult, assertions)

      let result: SnippetTestResult = {
        snippet,
        passed,
        skipped: false,
        error: passed ? undefined : executionResult.error,
        executionResult,
        assertions,
      }

      // Call onTestComplete hook
      const testCompleteResults = await this.pluginManager.callHook("onTestComplete", result)
      const modifiedResult = testCompleteResults.find(r => r !== undefined)
      if (modifiedResult) {
        result = modifiedResult
      }

      return result
    } catch (error) {
      // Call onError hook
      await this.pluginManager.callHook("onError", error as Error, snippet)

      // Re-throw to allow normal error handling
      throw error
    }
  }

  /**
   * Determine if a snippet should be skipped
   */
  private shouldSkipSnippet(snippet: CodeSnippet): { skip: boolean; reason?: string } {
    // Check for explicit skip directive
    const skipDirective = getDirective(snippet, "skip")
    if (skipDirective) {
      const skipHandler = getDirectiveByName("skip")
      if (skipHandler && skipHandler.type === "control") {
        const result = skipHandler.handler(snippet, skipDirective)
        if (result) {
          return result
        }
      }
    }

    // Use custom skip predicate if provided
    if (this.options.shouldSkip) {
      return this.options.shouldSkip(snippet)
    }

    return { skip: false }
  }

  /**
   * Run all assertions for a snippet
   */
  private async runAssertions(
    snippet: CodeSnippet,
    executionResult: {
      success: boolean
      error?: Error
      logs: string[]
      returnValue?: unknown
    }
  ): Promise<AssertionResult[]> {
    const assertions: AssertionResult[] = []

    // Get all assertion directive names
    const assertionNames = [
      "expect-error",
      "expect-no-error",
      "expect-output",
      "expect-output-regex",
      "expect-return",
      "expect-return-json",
    ]

    // Run each assertion directive if present
    for (const directiveName of assertionNames) {
      // Handle multiple instances of same directive (e.g., multiple expect-output)
      const directives = getDirectives(snippet, directiveName)

      for (const directive of directives) {
        // Check built-in directives first, then plugin directives
        const directiveHandler = getDirectiveByName(directiveName)
          || this.pluginManager.getDirective(directiveName)

        if (directiveHandler && directiveHandler.type === "assertion") {
          assertions.push(directiveHandler.handler(executionResult, directive))
        } else if (!directiveHandler && this.options.verbose) {
          // Warn about unknown assertion directives in verbose mode
          console.warn(`[SnippetRunner] Unknown assertion directive: ${directiveName} in ${snippet.file}:${snippet.line}`)
        }
      }
    }

    return assertions
  }

  /**
   * Determine if the test passed
   */
  private determineTestSuccess(
    snippet: CodeSnippet,
    executionResult: { success: boolean; error?: Error },
    assertions: AssertionResult[]
  ): boolean {
    // If we have assertions, all must pass
    if (assertions.length > 0) {
      return assertions.every(a => a.passed)
    }

    // If no assertions and no directives, just check execution success
    if (snippet.directives.length === 0) {
      return executionResult.success
    }

    // If we have directives but no assertions (shouldn't happen), check execution
    return executionResult.success
  }

  /**
   * Print test result
   */
  printResult(result: SnippetTestResult, options: { useColors?: boolean } = {}): void {
    if (result.skipped) {
      if (this.options.showSkipped !== false) {
        console.log(formatSkipMessage(result.snippet, result.skipReason || "Skipped", options))
      }
      return
    }

    if (result.passed) {
      if (this.options.showSuccess) {
        console.log(formatSuccessMessage(result.snippet, result.executionResult!, options))
      }
    } else {
      console.error(
        formatTestFailure(
          result.snippet,
          result.executionResult!,
          result.assertions,
          { ...options, showStackTrace: this.options.verbose }
        )
      )
    }
  }

  /**
   * Print summary of all results
   */
  printSummary(results: SnippetTestResult[], options: { useColors?: boolean } = {}): void {
    const { useColors = true } = options
    const c = useColors ? {
      green: "\x1b[32m",
      red: "\x1b[31m",
      yellow: "\x1b[33m",
      reset: "\x1b[0m",
      bold: "\x1b[1m",
    } : {
      green: "", red: "", yellow: "", reset: "", bold: "",
    }

    const total = results.length
    const passed = results.filter(r => r.passed && !r.skipped).length
    const failed = results.filter(r => !r.passed && !r.skipped).length
    const skipped = results.filter(r => r.skipped).length

    console.log("")
    console.log(c.bold + "━".repeat(80) + c.reset)
    console.log(c.bold + "📊 Test Summary" + c.reset)
    console.log(c.bold + "━".repeat(80) + c.reset)
    console.log("")
    console.log(`  Total:   ${total}`)
    console.log(`  ${c.green}✓ Passed: ${passed}${c.reset}`)
    console.log(`  ${c.red}✗ Failed: ${failed}${c.reset}`)
    console.log(`  ${c.yellow}⏭ Skipped: ${skipped}${c.reset}`)
    console.log("")
    console.log(c.bold + "━".repeat(80) + c.reset)
    console.log("")
  }

  /**
   * Cleanup and unload all plugins
   */
  async cleanup(): Promise<void> {
    await this.pluginManager.clear()
  }
}
