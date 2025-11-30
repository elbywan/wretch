/**
 * Extracts code snippets from markdown files with their associated directives.
 */

import type { CodeSnippet, Directive } from "./types.js"
import { DirectiveParser } from "./parser.js"
import type { PluginManager } from "./plugin.js"

export interface ExtractorOptions {
  /** Languages to extract (defaults to js, javascript, ts, typescript) */
  languages?: string[]
  /** Whether to include snippets without any directives */
  includeUndirected?: boolean
  /** Plugin manager for lifecycle hooks */
  pluginManager?: PluginManager
}

/**
 * Extracts code snippets from markdown content
 */
export class SnippetExtractor {
  private options: ExtractorOptions
  private pluginManager?: PluginManager

  constructor(options: ExtractorOptions = {}) {
    this.options = {
      languages: options.languages || ["js", "javascript", "ts", "typescript"],
      includeUndirected: options.includeUndirected ?? true,
    }
    this.pluginManager = options.pluginManager
  }

  /**
   * Extract snippets from markdown content
   */
  async extract(content: string, filePath: string): Promise<CodeSnippet[]> {
    // Call onBeforeExtract hook
    if (this.pluginManager) {
      const beforeResults = await this.pluginManager.callHook("onBeforeExtract", filePath, content)

      // Check if any plugin wants to skip this file
      for (const result of beforeResults) {
        if (result === false) {
          return []
        }
        // Allow plugins to modify content
        if (typeof result === "string") {
          content = result
        }
      }
    }

    const lines = content.split("\n")
    const snippets: CodeSnippet[] = []
    const parser = new DirectiveParser()

    let inCodeBlock = false
    let currentLanguage = ""
    let currentCode: string[] = []
    let startLine = 0
    let snippetIndex = 0
    let pendingDirectives: Directive[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Parse directives
      const directives = parser.parseLine(line, i + 1) // 1-based line numbers
      if (directives.length > 0) {
        pendingDirectives.push(...directives)
        continue
      }

      // Check for code block start
      const codeBlockMatch = line.match(/^```(\w+)/)

      if (codeBlockMatch && !inCodeBlock) {
        const language = codeBlockMatch[1]
        if (this.options.languages!.includes(language)) {
          inCodeBlock = true
          currentLanguage = language
          currentCode = []
          startLine = i + 2 // Line after the fence (1-based)
        }
      } else if (line.trim() === "```" && inCodeBlock) {
        // Code block end
        inCodeBlock = false

        if (currentCode.length > 0) {
          // Only include if we have directives or includeUndirected is true
          if (pendingDirectives.length > 0 || this.options.includeUndirected) {
            snippets.push({
              code: currentCode.join("\n"),
              language: currentLanguage,
              file: filePath,
              line: startLine,
              index: snippetIndex++,
              directives: [...pendingDirectives],
            })
          }
        }

        currentCode = []
        pendingDirectives = []
      } else if (inCodeBlock) {
        // Inside code block
        currentCode.push(line)
      }
    }

    // Call onAfterExtract hook
    let finalSnippets = snippets
    if (this.pluginManager) {
      const afterResults = await this.pluginManager.callHook("onAfterExtract", filePath, snippets)

      // Allow plugins to modify snippets
      for (const result of afterResults) {
        if (Array.isArray(result)) {
          finalSnippets = result
        }
      }
    }

    return finalSnippets
  }

  /**
   * Extract snippets from a file (async file reading)
   */
  async extractFromFile(filePath: string, readFile: (path: string) => Promise<string>): Promise<CodeSnippet[]> {
    const content = await readFile(filePath)
    return await this.extract(content, filePath)
  }

  /**
   * Extract snippets from multiple files
   */
  async extractFromFiles(
    filePaths: string[],
    readFile: (path: string) => Promise<string>
  ): Promise<CodeSnippet[]> {
    const allSnippets: CodeSnippet[] = []

    for (const filePath of filePaths) {
      const snippets = await this.extractFromFile(filePath, readFile)
      allSnippets.push(...snippets)
    }

    return allSnippets
  }
}

/**
 * Helper to get a directive by name
 */
export function getDirective(snippet: CodeSnippet, name: string): Directive | undefined {
  return snippet.directives.find(d => d.name === name)
}

/**
 * Helper to get all directives by name
 */
export function getDirectives(snippet: CodeSnippet, name: string): Directive[] {
  return snippet.directives.filter(d => d.name === name)
}

/**
 * Helper to check if a snippet has a directive
 */
export function hasDirective(snippet: CodeSnippet, name: string): boolean {
  return snippet.directives.some(d => d.name === name)
}

/**
 * Helper to get directive argument as string
 */
export function getDirectiveArg(snippet: CodeSnippet, name: string): string | undefined {
  const directive = getDirective(snippet, name)
  if (!directive) return undefined

  if (typeof directive.args === "string") {
    return directive.args
  }

  return undefined
}

/**
 * Helper to get directive argument as number
 */
export function getDirectiveArgNumber(snippet: CodeSnippet, name: string): number | undefined {
  const directive = getDirective(snippet, name)
  if (!directive) return undefined

  if (typeof directive.args === "number") {
    return directive.args
  }

  return undefined
}

/**
 * Helper to get directive argument as boolean
 */
export function getDirectiveArgBoolean(snippet: CodeSnippet, name: string): boolean {
  const directive = getDirective(snippet, name)
  if (!directive) return false

  if (typeof directive.args === "boolean") {
    return directive.args
  }

  return false
}
