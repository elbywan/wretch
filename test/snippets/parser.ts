/**
 * Parser for snippet directives in markdown comments.
 * Handles multi-line directives and multiple chained directives.
 */

import type { Directive, DirectiveArgs } from "./types.js"

/**
 * Parse directives from a line or multi-line comment
 * Supports:
 * - Single line: <!-- snippet:skip -->
 * - Single line with args: <!-- snippet:timeout 5000 -->
 * - Multi-line: <!-- snippet:description
 *                    This is a description -->
 * - Chained: <!-- snippet:await snippet:timeout 10000 -->
 */
export class DirectiveParser {
  private commentBuffer: string[] = []
  private commentStartLine = -1

  /**
   * Process a line and extract any directives
   */
  parseLine(line: string, lineNumber: number): Directive[] {
    const directives: Directive[] = []

    // Check for comment start
    const commentStartMatch = line.match(/<!--/)
    const commentEndMatch = line.match(/-->/)

    if (commentStartMatch && commentEndMatch) {
      // Single line comment
      const content = line.substring(
        commentStartMatch.index! + 4,
        commentEndMatch.index!
      )
      directives.push(...this.parseCommentContent(content, lineNumber))
    } else if (commentStartMatch) {
      // Multi-line comment start
      this.commentBuffer = [line.substring(commentStartMatch.index! + 4)]
      this.commentStartLine = lineNumber
    } else if (commentEndMatch && this.commentBuffer.length > 0) {
      // Multi-line comment end
      this.commentBuffer.push(line.substring(0, commentEndMatch.index!))
      const content = this.commentBuffer.join("\n")
      directives.push(...this.parseCommentContent(content, this.commentStartLine))
      this.commentBuffer = []
      this.commentStartLine = -1
    } else if (this.commentBuffer.length > 0) {
      // Multi-line comment continuation
      this.commentBuffer.push(line)
    }

    return directives
  }

  /**
   * Parse the content of a comment for directives
   */
  private parseCommentContent(content: string, lineNumber: number): Directive[] {
    const directives: Directive[] = []

    // Normalize whitespace but preserve structure for multi-line content
    const normalized = content.trim()

    // Match all snippet directives in the comment
    // Supports chained directives: snippet:await snippet:timeout 5000
    const directiveRegex = /snippet:([a-z-]+)(?:[ \t]+([^\n]*))?(?=\n|$)/gi
    let match: RegExpExecArray | null

    while ((match = directiveRegex.exec(normalized)) !== null) {
      const name = match[1]
      const argsString = match[2]?.trim()

      const args = this.parseDirectiveArgs(name, argsString)

      directives.push({
        name,
        args,
        line: lineNumber,
      })
    }

    return directives
  }

  /**
   * Parse directive arguments based on the directive type
   */
  private parseDirectiveArgs(name: string, argsString?: string): DirectiveArgs {
    if (!argsString) {
      // Directives with no args default to true
      return true
    }

    // Handle different directive types
    switch (name) {
    case "skip":
      // Skip can have a reason string
      return argsString

    case "timeout":
      // Timeout expects a number
      return parseInt(argsString, 10)

    case "expect-error":
      // expect-error can be a quoted string or true
      return this.parseQuotedString(argsString) || true

    case "expect-output":
    case "expect-return":
      // These expect a quoted string
      return this.parseQuotedString(argsString) || argsString

    case "expect-output-regex":
      // Expects a regex pattern /pattern/flags
      return this.parseRegex(argsString) || argsString

    case "expect-return-json":
      // Expects JSON path and value: path="$.user.id" value="123"
      return this.parseKeyValuePairs(argsString)

    case "return-pattern":
      // Expects a pattern like "const _ = " or "return "
      return this.parseQuotedString(argsString) || argsString

    case "description":
      // Description can be multi-line text
      return argsString

    case "await":
    case "expect-no-error":
      // These are boolean flags
      return true

    default:{
      // Try to parse as key-value pairs, otherwise return as string
      const kvPairs = this.parseKeyValuePairs(argsString)
      return Object.keys(kvPairs).length > 0 ? kvPairs : argsString
    }
    }
  }

  /**
   * Parse a quoted string
   */
  private parseQuotedString(input: string): string | null {
    const match = input.match(/^["'](.*)["']$/)
    if (match) {
      return match[1]
    }

    // Also try to match quoted strings with escapes
    const quotedMatch = input.match(/^"((?:[^"\\]|\\.)*)"|^'((?:[^'\\]|\\.)*)'/)
    if (quotedMatch) {
      return quotedMatch[1] || quotedMatch[2]
    }

    return null
  }

  /**
   * Parse a regex pattern /pattern/flags
   */
  private parseRegex(input: string): RegExp | null {
    const match = input.match(/^\/(.+?)\/([gimsuvy]*)$/)
    if (match) {
      try {
        return new RegExp(match[1], match[2])
      } catch {
        return null
      }
    }
    return null
  }

  /**
   * Parse key-value pairs: key1="value1" key2=123
   */
  private parseKeyValuePairs(input: string): Record<string, string | number | boolean | RegExp> {
    const pairs: Record<string, string | number | boolean | RegExp> = {}

    // Match key="value" or key=value patterns
    const kvRegex = /(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g
    let match: RegExpExecArray | null

    while ((match = kvRegex.exec(input)) !== null) {
      const key = match[1]
      const value = match[2] || match[3] || match[4]

      // Try to parse as number
      const numValue = Number(value)
      if (!isNaN(numValue) && value !== "") {
        pairs[key] = numValue
        continue
      }

      // Try to parse as boolean
      if (value === "true" || value === "false") {
        pairs[key] = value === "true"
        continue
      }

      // Try to parse as regex
      const regexValue = this.parseRegex(value)
      if (regexValue) {
        pairs[key] = regexValue
        continue
      }

      // Store as string
      pairs[key] = value
    }

    return pairs
  }
}

/**
 * Utility function to parse directives from an array of lines
 */
export function parseDirectives(lines: string[]): Map<number, Directive[]> {
  const parser = new DirectiveParser()
  const directiveMap = new Map<number, Directive[]>()

  lines.forEach((line, index) => {
    const directives = parser.parseLine(line, index)
    if (directives.length > 0) {
      directiveMap.set(index, directives)
    }
  })

  return directiveMap
}
