
/**
 * Example plugin that adds a @benchmark directive to measure code execution time.
 *
 * This demonstrates how plugins can:
 * 1. Register custom directives
 * 2. Store state across test runs via closures
 * 3. Modify test results with metadata
 * 4. Generate summary reports
 *
 * Usage in snippets:
 * ```typescript
 * // @benchmark
 * // @expectReturn 42
 * function expensiveOperation() {
 *   return 42;
 * }
 * ```
 */

import type { Plugin } from "../plugin.js"
import type { ControlDirective } from "../directives/types.js"
import type { SnippetTestResult, CodeSnippet } from "../types.js"

export interface BenchmarkResult {
  file: string
  snippet: number
  duration: number
  description?: string
}

export interface BenchmarkPluginOptions {
  /**
   * Threshold in milliseconds - snippets taking longer will be highlighted
   */
  threshold?: number

  /**
   * Whether to print results after each test
   */
  printPerTest?: boolean

  /**
   * Whether to print a summary report at the end
   */
  printSummary?: boolean

  /**
   * Custom formatter for benchmark results
   */
  formatter?: (result: BenchmarkResult) => string
}

/**
 * Default formatter for benchmark results
 */
function defaultFormatter(result: BenchmarkResult): string {
  const desc = result.description ? ` (${result.description})` : ""
  return `⏱️  ${result.file}:${result.snippet}${desc} - ${result.duration.toFixed(2)}ms`
}

/**
 * Print a summary of all benchmark results
 */
function printBenchmarkSummary(
  results: BenchmarkResult[],
  threshold: number,
  formatter: (r: BenchmarkResult) => string
): void {
  console.log("\n" + "=".repeat(60))
  console.log("📊 BENCHMARK SUMMARY")
  console.log("=".repeat(60))

  // Sort by duration (slowest first)
  const sorted = [...results].sort((a, b) => b.duration - a.duration)

  console.log("\nTop 5 Slowest Snippets:")
  sorted.slice(0, 5).forEach((result, index) => {
    const marker = result.duration > threshold ? "⚠️ " : "  "
    console.log(`${marker}${index + 1}. ${formatter(result)}`)
  })

  // Calculate statistics
  const durations = results.map(r => r.duration)
  const total = durations.reduce((sum, d) => sum + d, 0)
  const avg = total / durations.length
  const max = Math.max(...durations)
  const min = Math.min(...durations)
  const exceeded = results.filter(r => r.duration > threshold).length

  console.log("\nStatistics:")
  console.log(`  Total snippets: ${results.length}`)
  console.log(`  Total time: ${total.toFixed(2)}ms`)
  console.log(`  Average: ${avg.toFixed(2)}ms`)
  console.log(`  Min: ${min.toFixed(2)}ms`)
  console.log(`  Max: ${max.toFixed(2)}ms`)
  console.log(`  Exceeded threshold (${threshold}ms): ${exceeded}`)

  console.log("=".repeat(60) + "\n")
}

/**
 * Creates a benchmark plugin with the given options
 */
export function createBenchmarkPlugin(options: BenchmarkPluginOptions = {}): Plugin {
  const {
    threshold = 100,
    printPerTest = false,
    printSummary = true,
    formatter = defaultFormatter
  } = options

  // Plugin state stored in closure
  const results: BenchmarkResult[] = []
  const benchmarkTimers = new Map<string, number>()

  // Create a unique key for each snippet
  const getSnippetKey = (snippet: CodeSnippet): string =>
    `${snippet.file}:${snippet.index}`

  /**
   * Custom @benchmark directive
   * This is a control directive that just marks the snippet for benchmarking
   */
  const benchmarkDirective: ControlDirective = {
    type: "control",
    name: "benchmark",
    description: "Measures the execution time of a code snippet",
    handler: _snippet => {
      // This directive doesn't skip anything, it just marks the snippet
      // The actual timing happens in the plugin hooks
      return null
    }
  }

  return {
    name: "benchmark-plugin",
    version: "1.0.0",
    description: "Measures and reports code execution times",

    // Register the custom directive
    directives: [benchmarkDirective],

    hooks: {
      onInit: async () => {
        if (printSummary) {
          console.log("📊 Benchmark plugin initialized (threshold: %dms)", threshold)
        }
      },

      onBeforeRun: async (snippet, _context) => {
        // Check if this snippet has the @benchmark directive
        const hasBenchmark = snippet.directives.some(d => d.name === "benchmark")

        if (hasBenchmark) {
          // Start timing
          const key = getSnippetKey(snippet)
          benchmarkTimers.set(key, performance.now())
        }

        // Continue with normal execution
        return undefined
      },

      onAfterRun: async (snippet, _result) => {
        const key = getSnippetKey(snippet)
        const startTime = benchmarkTimers.get(key)

        if (startTime !== undefined) {
          const duration = performance.now() - startTime

          const benchmarkResult: BenchmarkResult = {
            file: snippet.file,
            snippet: snippet.index,
            duration,
            description: snippet.directives.find(d => d.name === "description")?.args as string | undefined
          }

          results.push(benchmarkResult)

          if (printPerTest) {
            console.log(formatter(benchmarkResult))

            if (duration > threshold) {
              console.log("⚠️  Warning: Snippet exceeded threshold (%dms > %dms)",
                duration.toFixed(2), threshold)
            }
          }

          // Clean up timer
          benchmarkTimers.delete(key)
        }

        // Don't modify the result
        return undefined
      },

      onTestComplete: async _testResult => {
        // We could add benchmark data to test result here if SnippetTestResult supported metadata
        // For now, just store it in our results array
        return undefined
      },

      onComplete: async _allResults => {
        if (printSummary && results.length > 0) {
          printBenchmarkSummary(results, threshold, formatter)
        }
      },

      onError: async (error, snippet) => {
        // Clean up timer on error
        if (snippet) {
          const key = getSnippetKey(snippet)
          benchmarkTimers.delete(key)
        }
      }
    }
  }
}

/**
 * Default benchmark plugin instance with standard settings
 */
export const benchmarkPlugin = createBenchmarkPlugin({
  threshold: 100,
  printPerTest: false,
  printSummary: true
})

/**
 * Helper to extract benchmark results from test results
 */
export function extractBenchmarkResults(_testResults: SnippetTestResult[]): BenchmarkResult[] {
  // Since SnippetTestResult doesn't have metadata, we need to access results differently
  // This is just a helper that would work with the internal results array from the plugin
  return []
}

/**
 * Get all benchmark results from a benchmark plugin
 * Note: You would need to access the plugin's internal state to get the results
 */
export function getBenchmarkResults(_plugin: Plugin): BenchmarkResult[] {
  // This is a conceptual helper - actual implementation would depend on plugin structure
  return []
}
