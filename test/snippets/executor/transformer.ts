/**
 * Code transformation utilities
 * Handles wrapping code in async IIFEs and injecting return statements
 */

import type { CodeSnippet } from "../types.js"
import { getDirective, hasDirective } from "../extractor.js"

/**
 * Prepare code for execution
 * Handles:
 * - await directive (wraps in async IIFE)
 * - expect-return directive (adds return statement)
 * - return-statement directive (custom return expression)
 */
export function transformCode(snippet: CodeSnippet): string {
  const needsWrapping =
    hasDirective(snippet, "await") ||
    hasDirective(snippet, "return-statement") ||
    hasDirective(snippet, "expect-return") ||
    hasDirective(snippet, "expect-return-json")

  if (!needsWrapping) {
    return snippet.code
  }

  // Separate imports from code
  const lines = snippet.code.split("\n")
  const importLines: string[] = []
  const codeLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("import ") || trimmed.startsWith("export ")) {
      importLines.push(line)
    } else {
      codeLines.push(line)
    }
  }

  let wrappedCode = codeLines.join("\n")

  // Handle return statement injection
  if (hasDirective(snippet, "return-statement") || hasDirective(snippet, "expect-return") || hasDirective(snippet, "expect-return-json")) {
    const returnStatementDirective = getDirective(snippet, "return-statement")
    const returnStatementArgs = typeof returnStatementDirective?.args === "string" ? returnStatementDirective.args : undefined

    // Find the last statement by looking for the first non-continuation line
    // at the minimum indentation level (to avoid adding return inside nested structures)
    let minIndent = Infinity
    for (const line of codeLines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
        const indent = line.search(/\S/)
        if (indent >= 0 && indent < minIndent) minIndent = indent
      }
    }

    let lastStatementIndex = -1
    for (let i = codeLines.length - 1; i >= 0; i--) {
      const line = codeLines[i]
      const trimmed = line.trim()

      // Skip empty and comment lines
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
        continue
      }

      // Only consider lines at minimum indentation
      const indent = line.search(/\S/)
      if (indent === minIndent) {
        // Check if this line is a continuation (starts with ., ), ], or })
        const isContinuation = /^[.)\]}]/.test(trimmed)
        if (!isContinuation) {
          lastStatementIndex = i
          break
        }
      }
    }

    if (lastStatementIndex >= 0) {
      // Check if it already has a return statement
      if (!codeLines[lastStatementIndex].trim().startsWith("return ")) {
        if(returnStatementArgs) {
          codeLines.push(`return ${returnStatementArgs}`)
        } else {
          codeLines[lastStatementIndex] = "return " + codeLines[lastStatementIndex]
        }
      }
      wrappedCode = codeLines.join("\n")
    } else {
      // No valid statement found - log warning and use code as-is
      // This can happen with snippets that only contain comments or imports
      wrappedCode = codeLines.join("\n")
    }

    // Wrap in async IIFE and capture return value
    return `${importLines.join("\n")}\n\nglobalThis.__snippetReturnValue = await (async () => {\n${wrappedCode}\n})()`
  } else {
    // Just wrap in async IIFE
    return `${importLines.join("\n")}\n\nawait (async () => {\n${wrappedCode}\n})()`
  }
}

/**
 * Check if code needs transformation based on directives
 */
export function needsTransformation(snippet: CodeSnippet): boolean {
  return (
    hasDirective(snippet, "await") ||
    hasDirective(snippet, "return-statement") ||
    hasDirective(snippet, "expect-return") ||
    hasDirective(snippet, "expect-return-json")
  )
}
