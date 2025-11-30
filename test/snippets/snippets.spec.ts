import { describe, it, after } from "node:test"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { SnippetExtractor, SnippetRunner, SnippetTestResult } from "./index.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "../..")

const SNIPPET_FILES = [
  "README.md",
  "RECIPES.md",
  "MIGRATION_V2_V3.md",
]

/**
 * Module resolver for wretch imports
 */
async function resolveModule(specifier: string): Promise<unknown> {
  if (specifier === "wretch" || specifier === "wretch/middlewares" || specifier.startsWith("wretch/")) {
    let importPath: string
    if (specifier === "wretch") {
      importPath = "../../src/index.js"
    } else if (specifier === "wretch/middlewares") {
      importPath = "../../src/middlewares/index.js"
    } else if (specifier.startsWith("wretch/middlewares/")) {
      importPath = specifier.replace("wretch/middlewares/", "../../src/middlewares/") + ".js"
    } else if (specifier.startsWith("wretch/addons/")) {
      importPath = specifier.replace("wretch/addons/", "../../src/addons/") + ".js"
    } else {
      importPath = specifier.replace("wretch/", "../../src/") + ".js"
    }

    return await import(importPath)
  }
  throw new Error(`Unable to resolve module: ${specifier}`)
}

/**
 * Custom skip logic for wretch-specific patterns
 */
function shouldSkipSnippet(snippet: import("./index.js").CodeSnippet): { skip: boolean; reason?: string } {
  const { code } = snippet

  // Don't skip snippets with explicit directives - they have test expectations
  if (snippet.directives.length > 0) {
    return { skip: false }
  }

  if (
    code.includes("PageServerLoad") ||
    code.includes("GetServerSideProps") ||
    code.includes("$types") ||
    code.includes("next/server")
  ) {
    return { skip: true, reason: "Framework-specific example requiring special setup" }
  }

  if (/^export\s+type\s+/m.test(code) || /^export\s+interface\s+/m.test(code)) {
    return { skip: true, reason: "Type-only definition" }
  }

  if (snippet.file.includes("MIGRATION") && code.includes("❌")) {
    return { skip: true, reason: "Negative example (shows deprecated usage)" }
  }

  if (code.trim().split("\n").length < 2 && !code.includes("wretch(")) {
    return { skip: true, reason: "Too short to be meaningful" }
  }

  return { skip: false }
}

/**
 * Create execution context with wretch globals
 */
async function createExecutionContext(): Promise<import("./index.js").ExecutionContext> {
  return {
    globals: {
      fetch: globalThis.fetch,
      wretch: (await import("../../src/index.js")).default,
      AbortAddon: (await import("../../src/addons/abort.js")).default,
      BasicAuthAddon: (await import("../../src/addons/basicAuth.js")).default,
      QueryStringAddon: (await import("../../src/addons/queryString.js")).default,
      FormDataAddon: (await import("../../src/addons/formData.js")).default,
      ProgressAddon: (await import("../../src/addons/progress.js")).default,
      FormData: globalThis.FormData,
      URLSearchParams: globalThis.URLSearchParams,
      AbortController: globalThis.AbortController,
      Headers: globalThis.Headers,
      Response: globalThis.Response,
      Request: globalThis.Request,
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
      file: new File([new Uint8Array([0, 1, 2])], "blob.txt"),
    },
    moduleResolver: resolveModule,
  }
}

// Extract all snippets
const extractor = new SnippetExtractor()
const markdownFiles = SNIPPET_FILES
  .map(file => path.resolve(rootDir, file))

const allSnippets = await Promise.all(
  markdownFiles.map(file =>
    extractor.extractFromFile(file, p => fs.readFile(p, "utf-8"))
  )
).then(results => results.flat())

// Group snippets by file
const snippetsByFile = allSnippets.reduce((acc, snippet) => {
  if (!acc[snippet.file]) {
    acc[snippet.file] = []
  }
  acc[snippet.file].push(snippet)
  return acc
}, {} as Record<string, typeof allSnippets>)

// Create runner
const runner = new SnippetRunner({
  shouldSkip: shouldSkipSnippet,
  showSuccess: false,
  showSkipped: false,
  verbose: false,
  plugins: [
    // Add benchmark plugin
    // (await import("./examples/benchmark-plugin.ts")).createBenchmarkPlugin({
    //   threshold: 50,
    //   printPerTest: true,
    //   printSummary: true,
    // }),
  ]
})

// Initialize runner (loads plugins if any)
await runner.initialize()

// Create test context
const context = await createExecutionContext()

// Collect all results for the onComplete hook
const allResults: SnippetTestResult[] = []

// Run tests grouped by file
Object.entries(snippetsByFile).forEach(([file, snippets]) => {
  describe(file, { concurrency: true }, () => {
    snippets.forEach(snippet => {
      // Extract description directive if present
      const descriptionDirective = snippet.directives.find(d => d.name === "description")
      const description = descriptionDirective?.args
      const testName = description
        ? `${snippet.file}:${snippet.line} - ${description}`
        : `${snippet.file}:${snippet.line} - snippet ${snippet.index + 1}`

      it(testName, { timeout: 10_000, skip: false }, async t => {
        const result = await runner.runSnippet(snippet, context)
        allResults.push(result)

        if (result.skipped) {
          // Mark the test as skipped in Node.js test framework
          t.skip(result.skipReason || "Skipped")
          return
        }

        if (!result.passed) {
          // Print detailed error information
          runner.printResult(result, { useColors: true })

          // Throw an error to fail the test
          if (result.error) {
            throw result.error
          } else {
            const failedAssertions = result.assertions.filter(a => !a.passed)
            throw new Error(
              `Assertion failed:\n${failedAssertions.map(a => `  - ${a.message}`).join("\n")}`
            )
          }
        }
      })
    })
  })
})

// Call onComplete hook after all tests have run
after(async () => {
  await runner.getPluginManager().callHook("onComplete", allResults)
})
