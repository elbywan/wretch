/* eslint-disable no-console */
import { describe, it } from "node:test"
import * as fs from "node:fs"
import * as path from "node:path"
import vm from "node:vm"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "../..")

const SNIPPET_FILES = [
  "README.md",
  "RECIPES.md",
  "MIGRATION_V2_V3.md",
]

interface CodeSnippet {
  code: string
  language: string
  file: string
  line: number
  index: number
  skipTest?: boolean
  skipReason?: string
}

function extractSnippetsFromFile(filePath: string): CodeSnippet[] {
  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.split("\n")
  const snippets: CodeSnippet[] = []

  let inCodeBlock = false
  let currentLanguage = ""
  let currentCode: string[] = []
  let startLine = 0
  let snippetIndex = 0
  let shouldSkipNext = false
  let skipReason = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const skipCommentMatch = line.match(/<!--\s*snippet:skip(?:\s+(.+?))?\s*-->/)
    if (skipCommentMatch) {
      shouldSkipNext = true
      skipReason = skipCommentMatch[1] || "Manually skipped via magic comment"
      continue
    }

    const codeBlockMatch = line.match(/^```(\w+)/)

    if (codeBlockMatch && !inCodeBlock) {
      const language = codeBlockMatch[1]
      if (["javascript", "js", "typescript", "ts"].includes(language)) {
        inCodeBlock = true
        currentLanguage = language
        currentCode = []
        startLine = i + 1
      }
    } else if (line.trim() === "```" && inCodeBlock) {
      inCodeBlock = false
      if (currentCode.length > 0) {
        snippets.push({
          code: currentCode.join("\n"),
          language: currentLanguage,
          file: path.basename(filePath),
          line: startLine,
          index: snippetIndex++,
          skipTest: shouldSkipNext,
          skipReason: shouldSkipNext ? skipReason : undefined,
        })
      }
      currentCode = []
      shouldSkipNext = false
      skipReason = ""
    } else if (inCodeBlock) {
      currentCode.push(line)
    }
  }

  return snippets
}

function extractAllSnippets(): CodeSnippet[] {
  const markdownFiles = SNIPPET_FILES
    .map(file => path.resolve(rootDir, file))
    .filter(file => fs.existsSync(file))

  const allSnippets: CodeSnippet[] = []

  for (const file of markdownFiles) {
    const snippets = extractSnippetsFromFile(file)
    allSnippets.push(...snippets)
  }

  return allSnippets
}

function shouldSkipSnippet(snippet: CodeSnippet): { skip: boolean; reason?: string } {
  const { code } = snippet

  if (snippet.skipTest) {
    return { skip: true, reason: snippet.skipReason || "Skipped via magic comment" }
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

async function executeSnippet(snippet: CodeSnippet): Promise<void> {
  const logs: string[] = []
  const timers = new Map<string, number>()
  const mockConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
    error: (...args: unknown[]) => logs.push(`ERROR: ${args.map(String).join(" ")}`),
    warn: (...args: unknown[]) => logs.push(`WARN: ${args.map(String).join(" ")}`),
    info: (...args: unknown[]) => logs.push(`INFO: ${args.map(String).join(" ")}`),
    time: (label?: string) => timers.set(label || "default", Date.now()),
    timeEnd: (label?: string) => {
      const start = timers.get(label || "default")
      if (start) {
        const duration = Date.now() - start
        logs.push(`${label || "default"}: ${duration}ms`)
        timers.delete(label || "default")
      }
    },
    timeLog: (label?: string, ...args: unknown[]) => {
      const start = timers.get(label || "default")
      if (start) {
        const duration = Date.now() - start
        logs.push(`${label || "default"}: ${duration}ms ${args.map(String).join(" ")}`)
      }
    },
  }

  const context = vm.createContext({
    console: mockConsole,
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
  })

  const moduleCode = ts.transpile(snippet.code, { target: ts.ScriptTarget.ES2020 })

  const module = new vm.SourceTextModule(moduleCode, {
    context,
    identifier: `${snippet.file}:${snippet.line}`,
  })

  await module.link(async specifier => {
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

      const imported = await import(importPath)
      const exportNames = ["default", ...Object.keys(imported).filter(k => k !== "default")]

      const wretchwModule = new vm.SyntheticModule(
        exportNames,
        function () {
          this.setExport("default", imported.default || imported)
          Object.keys(imported).forEach(key => {
            if (key !== "default") {
              this.setExport(key, imported[key])
            }
          })
        },
        { context }
      )
      await wretchwModule.link(async () => {
        throw new Error("Unexpected import in synthetic module")
      })
      await wretchwModule.evaluate()
      return wretchwModule
    }
    throw new Error(`Unable to resolve module: ${specifier}`)
  })

  try {
    await module.evaluate({ timeout: 5000 })
  } catch (error) {
    console.error("\n" + "━".repeat(70))
    console.error("❌ SNIPPET TEST FAILED")
    console.error("━".repeat(70))

    console.error("\n🔴 Error:")
    console.error("  " + ((error as Error).message || String(error)))

    const codeLines = snippet.code.split("\n")
    const maxLineLength = codeLines.reduce((max, line) => Math.max(max, line.length), 0)
    console.error("\n💻 Snippet code:")
    console.error("┌" + "─".repeat(maxLineLength + 8) + "┐")
    codeLines.forEach((line, idx) => {
      const lineNum = (idx + 1).toString().padStart(3, " ")
      console.error("│ " + lineNum + " │ " + line.padEnd(maxLineLength + 1) + "│")
    })
    console.error("└" + "─".repeat(maxLineLength + 8) + "┘")

    if (logs.length > 0) {
      console.error("\n🪵 Logs:")
      console.error("┌" + "─".repeat(68) + "┐")
      logs.forEach(log => {
        const lines = log.split("\n")
        lines.forEach(line => console.error("│ " + line.padEnd(67) + "│"))
      })
      console.error("└" + "─".repeat(68) + "┘")
    }

    console.error("\n" + "━".repeat(70) + "\n")

    throw error
  }
}

const allSnippets = extractAllSnippets()

const snippetsByFile = allSnippets.reduce((acc, snippet) => {
  if (!acc[snippet.file]) {
    acc[snippet.file] = []
  }
  acc[snippet.file].push(snippet)
  return acc
}, {} as Record<string, CodeSnippet[]>)

Object.entries(snippetsByFile).forEach(([file, snippets]) => {
  describe(file, () => {
    snippets.forEach((snippet, index) => {
      const skipCheck = shouldSkipSnippet(snippet)
      const testName = `${snippet.file}:${snippet.line} - snippet ${index + 1}`

      if (skipCheck.skip) {
        it.skip(`${testName} - ${skipCheck.reason}`, async () => {
        })
      } else {
        it(testName, { timeout: 5_000 }, async () => {
          await executeSnippet(snippet)
        })
      }
    })
  })
})
