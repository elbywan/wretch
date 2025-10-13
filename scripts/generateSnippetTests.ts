import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"
import {
  extractAllSnippets,
  transformSnippet,
  type CodeSnippet,
} from "./extractSnippets.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface TestCase {
  name: string
  code: string
  skip: boolean
  skipReason?: string
}

/**
 * Check if a snippet should be skipped from testing
 */
function shouldSkipSnippet(snippet: CodeSnippet): { skip: boolean; reason?: string } {
  const { code } = snippet

  // Check for magic comment skip
  if (snippet.skipTest) {
    return { skip: true, reason: snippet.skipReason || "Skipped via magic comment" }
  }

  // Skip snippets that are clearly examples or pseudo-code
  // if (
  //   code.includes("// ...") ||
  //   code.includes("/* ... */") ||
  //   code.includes("...existing code...") ||
  //   code.includes("...") && code.split("\n").length < 5
  // ) {
  //   return { skip: true, reason: "Contains placeholder comments" }
  // }

  // Skip framework-specific code that requires special setup
  if (
    code.includes("PageServerLoad") ||
    code.includes("GetServerSideProps") ||
    code.includes("$types") ||
    code.includes("next/server")
  ) {
    return { skip: true, reason: "Framework-specific example requiring special setup" }
  }

  // Skip type-only definitions
  if (/^export\s+type\s+/m.test(code) || /^export\s+interface\s+/m.test(code)) {
    return { skip: true, reason: "Type-only definition" }
  }

  // Skip snippets that are error examples (showing what NOT to do)
  if (snippet.file.includes("MIGRATION") && code.includes("❌")) {
    return { skip: true, reason: "Negative example (shows deprecated usage)" }
  }

  // Skip very short snippets that are likely incomplete
  if (code.trim().split("\n").length < 2 && !code.includes("wretch(")) {
    return { skip: true, reason: "Too short to be meaningful" }
  }

  return { skip: false }
}

/**
 * Generate a standalone snippet file that uses VM to execute code
 */
function generateSnippetFile(snippet: CodeSnippet, _index: number): string {
  const code = transformSnippet(snippet)

  return `// Auto-generated from ${snippet.file}:${snippet.line}
import vm from "node:vm"
import { fileURLToPath } from "node:url"
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url)

// Execute the snippet code as-is in a VM module
const moduleCode = \`${code.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`

// Capture console output
const logs = []
const timers = new Map()
const mockConsole = {
  log: (...args) => logs.push(args.map(String).join(" ")),
  error: (...args) => logs.push(\`ERROR: \${args.map(String).join(" ")}\`),
  warn: (...args) => logs.push(\`WARN: \${args.map(String).join(" ")}\`),
  info: (...args) => logs.push(\`INFO: \${args.map(String).join(" ")}\`),
  time: (label) => timers.set(label || "default", Date.now()),
  timeEnd: (label) => {
    const start = timers.get(label || "default")
    if (start) {
      const duration = Date.now() - start
      logs.push(\`\${label || "default"}: \${duration}ms\`)
      timers.delete(label || "default")
    }
  },
  timeLog: (label, ...args) => {
    const start = timers.get(label || "default")
    if (start) {
      const duration = Date.now() - start
      logs.push(\`\${label || "default"}: \${duration}ms \${args.map(String).join(" ")}\`)
    }
  },
}

const context = vm.createContext({
  console: mockConsole,
  fetch: globalThis.fetch,
  wretch: (await import("wretch")).default,
  AbortAddon: (await import("wretch/addons/abort")).default,
  BasicAuthAddon: (await import("wretch/addons/basicAuth")).default,
  QueryStringAddon: (await import("wretch/addons/queryString")).default,
  FormDataAddon: (await import("wretch/addons/formData")).default,
  ProgressAddon: (await import("wretch/addons/progress")).default,
  FormData: globalThis.FormData,
  URLSearchParams: globalThis.URLSearchParams,
  AbortController: globalThis.AbortController,
  Headers: globalThis.Headers,
  Response: globalThis.Response,
  Request: globalThis.Request,
  setTimeout: globalThis.setTimeout,
  clearTimeout: globalThis.clearTimeout,
  file: new File([new Blob([0,1,2])], "blob.txt"),
})

const module = new vm.SourceTextModule(ts.transpile(moduleCode, { "target": "ES2020", }), {
  context,
  identifier: __filename,
})

// Link imports
await module.link(async (specifier) => {
  if (specifier === "wretch" || specifier === "wretch/middlewares" || specifier.startsWith("wretch/")) {
    const imported = await import(specifier)
    const exportNames = ["default", ...Object.keys(imported).filter(k => k !== "default")]

    const wretchwModule = new vm.SyntheticModule(
      exportNames,
      function() {
        this.setExport("default", imported.default || imported)
        // Export named exports if they exist
        Object.keys(imported).forEach(key => {
          if (key !== "default") {
            this.setExport(key, imported[key])
          }
        })
      },
      { context }
    )
    await wretchwModule.link(() => {})
    await wretchwModule.evaluate()
    return wretchwModule
  }
  throw new Error(\`Unable to resolve module: \${specifier}\`)
})

try {
  await module.evaluate({ timeout: 5000 })
  // Test passed - logs are suppressed
} catch (error) {
  // Test failed - display formatted error with context
  console.error("\\n" + "━".repeat(70))
  console.error("❌ SNIPPET TEST FAILED")
  console.error("━".repeat(70))

  // Display error message
  console.error("\\n🔴 Error:")
  console.error("  " + (error.message || error.toString()))

  // Display snippet code
  const codeLines = moduleCode.split("\\n")
  const maxLineLength = codeLines.reduce((max, line) => Math.max(max, line.length), 0)
  console.error("\\n💻 Snippet code:")
  console.error("┌" + "─".repeat(maxLineLength + 8) + "┐")
  codeLines.forEach((line, idx) => {
    const lineNum = (idx + 1).toString().padStart(3, " ")
    console.error("│ " + lineNum + " │ " + line.padEnd(maxLineLength + 1) + "│")
  })
  console.error("└" + "─".repeat(maxLineLength + 8) + "┘")

  // Display logs if any
  if (logs.length > 0) {
    console.error("\\n🪵 Logs:")
    console.error("┌" + "─".repeat(68) + "┐")
    logs.forEach(log => {
      const lines = log.split("\\n")
      lines.forEach(line => console.error("│ " + line.padEnd(67) + "│"))
    })
    console.error("└" + "─".repeat(68) + "┘")
  }

  console.error("\\n" + "━".repeat(70) + "\\n")

  throw error
}
`
}/**
 * Prepare test case metadata
 */
function prepareTestCase(snippet: CodeSnippet, index: number): TestCase {
  const skipCheck = shouldSkipSnippet(snippet)
  if (skipCheck.skip) {
    return {
      name: `${snippet.file}:${snippet.line} - snippet ${index + 1}`,
      code: "",
      skip: true,
      skipReason: skipCheck.reason,
    }
  }

  return {
    name: `${snippet.file}:${snippet.line} - snippet ${index + 1}`,
    code: generateSnippetFile(snippet, index),
    skip: false,
  }
}

/**
 * Generate the main test file that imports and runs all snippets
 */
function generateTestFile(testCases: TestCase[]): string {
  const tests = testCases
    .map(testCase => {
      if (testCase.skip) {
        return `
  it.skip("${testCase.name} - ${testCase.skipReason}", async () => {
    // Skipped: ${testCase.skipReason}
  })`
      }

      return `
  it("${testCase.name}", async () => {
    await import("./${testCase.name}.js")
  })`
    })
    .join("\n")

  return `// This file is auto-generated by scripts/generateSnippetTests.ts
// DO NOT EDIT MANUALLY - it will be overwritten

import { describe, it } from "node:test"

describe("Documentation Snippets", () => {
${tests}
})
`
}

/**
 * Main function to extract snippets and generate tests
 */
async function main() {
  const rootDir = path.resolve(__dirname, "..")
  const outputDir = path.join(rootDir, "test", "generated")

  // Clean and recreate output directory
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true })
  }
  fs.mkdirSync(outputDir, { recursive: true })

  // Extract snippets
  const snippets = extractAllSnippets(rootDir)
  // eslint-disable-next-line no-console
  console.log(`📝 Found ${snippets.length} code snippets in documentation`)

  // Generate test cases
  const testCases = snippets.map((snippet, index) => prepareTestCase(snippet, index))

  // Write individual snippet files
  testCases.forEach(testCase => {
    if (!testCase.skip) {
      const snippetPath = path.join(outputDir, `${testCase.name}.js`)
      fs.writeFileSync(snippetPath, testCase.code, "utf-8")
    }
  })

  // Generate main test file
  const testCode = generateTestFile(testCases)
  const outputPath = path.join(outputDir, "snippets.spec.ts")
  fs.writeFileSync(outputPath, testCode, "utf-8")

  const skipped = testCases.filter(tc => tc.skip).length
  // eslint-disable-next-line no-console
  console.log(`✅ Generated test files in: ${outputDir}`)
  // eslint-disable-next-line no-console
  console.log(`   - ${testCases.length - skipped} testable snippets (${testCases.length - skipped} files)`)
  // eslint-disable-next-line no-console
  console.log(`   - ${skipped} skipped snippets`)
  // eslint-disable-next-line no-console
  console.log("   - 1 main test file: snippets.spec.ts")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    // eslint-disable-next-line no-console
    console.error("Error generating tests:", error)
    process.exit(1)
  })
}

export { generateTestFile, generateSnippetFile, prepareTestCase, shouldSkipSnippet }
