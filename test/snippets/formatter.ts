/**
 * Error formatting and diagnostic messages for snippet testing.
 * Provides clear, actionable error messages when tests fail.
 */

import type { CodeSnippet, ExecutionResult, AssertionResult } from "./types.js"

export interface ErrorFormatOptions {
  /** Show full stack traces */
  showStackTrace?: boolean
  /** Maximum line length for code display */
  maxLineLength?: number
  /** Use colors (ANSI codes) */
  useColors?: boolean
}

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
}

/**
 * Format a test failure with rich diagnostic information
 */
export function formatTestFailure(
  snippet: CodeSnippet,
  executionResult: ExecutionResult,
  assertions: AssertionResult[],
  options: ErrorFormatOptions = {}
): string {
  const {
    showStackTrace = false,
    maxLineLength = 100,
    useColors = true,
  } = options

  const c = useColors ? COLORS : Object.fromEntries(
    Object.keys(COLORS).map(k => [k, ""])
  ) as typeof COLORS

  const parts: string[] = []

  // Header
  parts.push("")
  parts.push(c.red + "━".repeat(80) + c.reset)
  parts.push(c.red + c.bold + "❌ SNIPPET TEST FAILED" + c.reset)
  parts.push(c.red + "━".repeat(80) + c.reset)
  parts.push("")

  // Location
  parts.push(c.bold + "📍 Location:" + c.reset)
  parts.push(`   ${snippet.file}:${snippet.line} (snippet #${snippet.index + 1})`)
  parts.push("")

  // Description if available
  const description = snippet.directives.find(d => d.name === "description")
  if (description && typeof description.args === "string") {
    parts.push(c.bold + "📝 Description:" + c.reset)
    parts.push(`   ${description.args}`)
    parts.push("")
  }

  // Error details
  if (executionResult.error) {
    parts.push(c.bold + c.red + "🔴 Error:" + c.reset)
    parts.push(`   ${executionResult.error.message}`)

    if (showStackTrace && executionResult.error.stack) {
      parts.push("")
      parts.push(c.gray + "Stack trace:" + c.reset)
      const stackLines = executionResult.error.stack.split("\n").slice(1)
      stackLines.forEach(line => {
        parts.push(c.gray + "   " + line + c.reset)
      })
    }

    parts.push("")
  }

  // Failed assertions
  const failedAssertions = assertions.filter(a => !a.passed)
  if (failedAssertions.length > 0) {
    parts.push(c.bold + c.red + "❌ Failed Assertions:" + c.reset)
    failedAssertions.forEach((assertion, index) => {
      parts.push(`   ${index + 1}. ${assertion.message}`)

      if (assertion.expected !== undefined) {
        parts.push(c.gray + "      Expected: " + formatValue(assertion.expected) + c.reset)
      }

      if (assertion.actual !== undefined) {
        parts.push(c.gray + "      Actual:   " + formatValue(assertion.actual) + c.reset)
      }
    })
    parts.push("")
  }

  // Code snippet
  parts.push(c.bold + "💻 Code:" + c.reset)
  const codeLines = snippet.code.split("\n")
  const lineNumberWidth = String(snippet.line + codeLines.length - 1).length

  const maxCodeLineLength = Math.min(
    maxLineLength,
    Math.max(...codeLines.map(l => l.length))
  )

  parts.push("   ┌" + "─".repeat(maxCodeLineLength + lineNumberWidth + 5) + "┐")

  codeLines.forEach((line, idx) => {
    const lineNum = String(snippet.line + idx).padStart(lineNumberWidth, " ")
    const truncatedLine = line.length > maxLineLength
      ? line.substring(0, maxLineLength - 3) + "..."
      : line
    const paddedLine = truncatedLine.padEnd(maxCodeLineLength)

    parts.push(
      `   │ ${c.gray}${lineNum}${c.reset} │ ${paddedLine} │`
    )
  })

  parts.push("   └" + "─".repeat(maxCodeLineLength + lineNumberWidth + 5) + "┘")
  parts.push("")

  // Directives
  if (snippet.directives.length > 0) {
    parts.push(c.bold + "⚙️  Directives:" + c.reset)
    snippet.directives.forEach(directive => {
      const argsStr = formatDirectiveArgs(directive.args)
      parts.push(`   • ${directive.name}${argsStr ? `: ${argsStr}` : ""}`)
    })
    parts.push("")
  }

  // Console output
  if (executionResult.logs.length > 0) {
    parts.push(c.bold + "🪵 Console Output:" + c.reset)
    parts.push("   ┌" + "─".repeat(76) + "┐")

    executionResult.logs.forEach(log => {
      const logLines = log.split("\n")
      logLines.forEach(line => {
        const truncatedLine = line.length > 75
          ? line.substring(0, 72) + "..."
          : line
        parts.push("   │ " + truncatedLine.padEnd(75) + "│")
      })
    })

    parts.push("   └" + "─".repeat(76) + "┘")
    parts.push("")
  }

  // Execution time
  parts.push(c.gray + `⏱️  Execution time: ${executionResult.duration}ms` + c.reset)
  parts.push("")

  // Footer
  parts.push(c.red + "━".repeat(80) + c.reset)
  parts.push("")

  return parts.join("\n")
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === undefined) return "undefined"
  if (value === null) return "null"

  if (typeof value === "string") {
    return `"${value}"`
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  return String(value)
}

/**
 * Format directive arguments for display
 */
function formatDirectiveArgs(args: unknown): string {
  if (args === true) return ""
  if (args === false) return "false"

  if (typeof args === "string") {
    return `"${args}"`
  }

  if (typeof args === "number") {
    return String(args)
  }

  if (args instanceof RegExp) {
    return String(args)
  }

  if (typeof args === "object" && args !== null) {
    return JSON.stringify(args)
  }

  return String(args)
}

/**
 * Format a skip message
 */
export function formatSkipMessage(
  snippet: CodeSnippet,
  reason: string,
  options: ErrorFormatOptions = {}
): string {
  const { useColors = true } = options
  const c = useColors ? COLORS : Object.fromEntries(
    Object.keys(COLORS).map(k => [k, ""])
  ) as typeof COLORS

  return `${c.yellow}⏭️  Skipped${c.reset} ${snippet.file}:${snippet.line} - ${reason}`
}

/**
 * Format a success message
 */
export function formatSuccessMessage(
  snippet: CodeSnippet,
  executionResult: ExecutionResult,
  options: ErrorFormatOptions = {}
): string {
  const { useColors = true } = options
  const c = useColors ? COLORS : Object.fromEntries(
    Object.keys(COLORS).map(k => [k, ""])
  ) as typeof COLORS

  const description = snippet.directives.find(d => d.name === "description")
  const descText = description && typeof description.args === "string"
    ? ` - ${description.args}`
    : ""

  return `${c.green}✓${c.reset} ${snippet.file}:${snippet.line}${descText} ${c.gray}(${executionResult.duration}ms)${c.reset}`
}
