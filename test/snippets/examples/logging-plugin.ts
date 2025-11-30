/**
 * Example plugin: Logging Plugin
 *
 * This plugin demonstrates the plugin system by logging test execution events.
 * It shows how to use lifecycle hooks to monitor test progress.
 */

import { definePlugin, type Plugin } from "../plugin.js"
import type { CodeSnippet, ExecutionResult, SnippetTestResult } from "../types.js"

export interface LoggingPluginOptions {
  /** Whether to log test start events */
  logStart?: boolean
  /** Whether to log test completion events */
  logComplete?: boolean
  /** Whether to log errors */
  logErrors?: boolean
  /** Whether to log to console or collect in array */
  mode?: "console" | "collect"
}

/**
 * Create a logging plugin with custom options
 */
export function createLoggingPlugin(options: LoggingPluginOptions = {}): Plugin {
  const {
    logStart = true,
    logComplete = true,
    logErrors = true,
    mode = "console",
  } = options

  const logs: string[] = []

  function log(message: string): void {
    if (mode === "console") {
      console.log(`[LoggingPlugin] ${message}`)
    } else {
      logs.push(message)
    }
  }

  return definePlugin({
    name: "logging-plugin",
    version: "1.0.0",
    description: "Logs test execution events for debugging and monitoring",

    onLoad() {
      log("Plugin loaded")
    },

    onUnload() {
      log("Plugin unloaded")
    },

    hooks: {
      async onInit() {
        log("Test suite initialized")
      },

      async onBeforeExtract(filePath, _content) {
        log(`Extracting snippets from: ${filePath}`)
        // Return undefined to continue normally
      },

      async onAfterExtract(filePath, snippets) {
        log(`Extracted ${snippets.length} snippets from: ${filePath}`)
        // Return undefined to keep snippets unchanged
      },

      async onBeforeRun(snippet: CodeSnippet, _context) {
        if (logStart) {
          log(`Running snippet: ${snippet.file}:${snippet.line}`)
        }
        // Return undefined to continue normally
      },

      async onAfterRun(snippet: CodeSnippet, result: ExecutionResult) {
        if (logComplete) {
          const status = result.success ? "✓" : "✗"
          log(`${status} Snippet completed: ${snippet.file}:${snippet.line}`)
        }
        // Return undefined to keep result unchanged
      },

      async onTestComplete(result: SnippetTestResult) {
        if (logComplete) {
          const status = result.skipped ? "⏭" : result.passed ? "✓" : "✗"
          log(`${status} Test complete: ${result.snippet.file}:${result.snippet.line}`)
        }
        // Return undefined to keep result unchanged
      },

      async onComplete(results: SnippetTestResult[]) {
        const passed = results.filter(r => r.passed && !r.skipped).length
        const failed = results.filter(r => !r.passed && !r.skipped).length
        const skipped = results.filter(r => r.skipped).length

        log("═".repeat(60))
        log(`Test suite complete: ${passed} passed, ${failed} failed, ${skipped} skipped`)
        log("═".repeat(60))
      },

      async onError(error: Error, snippet?: CodeSnippet) {
        if (logErrors) {
          if (snippet) {
            log(`ERROR in ${snippet.file}:${snippet.line} - ${error.message}`)
          } else {
            log(`ERROR: ${error.message}`)
          }
        }
      },
    },

    // Expose logs for testing when in collect mode
    ...(mode === "collect" ? { getLogs: () => logs } : {}),
  })
}

/**
 * Default logging plugin instance
 */
export const loggingPlugin = createLoggingPlugin()
