import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SNIPPET_FILES = [
  "README.md",
  "RECIPES.md",
  "MIGRATION_V2_V3.md",
]

export interface CodeSnippet {
  code: string
  language: string
  file: string
  line: number
  index: number
  skipTest?: boolean
  skipReason?: string
}

/**
 * Extract code snippets from a markdown file
 */
export function extractSnippetsFromFile(filePath: string): CodeSnippet[] {
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

    // Check for skip magic comment
    const skipCommentMatch = line.match(/<!--\s*snippet:skip(?:\s+(.+?))?\s*-->/)
    if (skipCommentMatch) {
      shouldSkipNext = true
      skipReason = skipCommentMatch[1] || "Manually skipped via magic comment"
      continue
    }

    const codeBlockMatch = line.match(/^```(\w+)/)

    if (codeBlockMatch && !inCodeBlock) {
      // Start of code block
      const language = codeBlockMatch[1]
      // Only extract JavaScript/TypeScript snippets
      if (["javascript", "js", "typescript", "ts"].includes(language)) {
        inCodeBlock = true
        currentLanguage = language
        currentCode = []
        startLine = i + 1
      }
    } else if (line.trim() === "```" && inCodeBlock) {
      // End of code block
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

/**
 * Extract code snippets from all markdown files in the project
 */
export function extractAllSnippets(rootDir: string): CodeSnippet[] {
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

/**
 * Determine if a snippet needs wrapping based on its content
 */
export function needsWrapping(code: string): boolean {
  // If the code already has import statements or is a complete module, don't wrap
  const trimmed = code.trim()

  // Check if it looks like a complete example (has imports and exports)
  const hasExport = /^export\s+/m.test(trimmed)

  // If it has imports but no exports, it might be a partial example that needs completion
  // If it has neither, it definitely needs wrapping
  // If it has both, it's probably a complete module

  return !hasExport
}

/**
 * Extract variables that are likely placeholders or need to be defined
 */
export function extractUndefinedVariables(code: string): string[] {
  const variables = new Set<string>()

  // Look for common variable usage patterns
  const varPattern = /\b([a-z][a-zA-Z0-9]*)\s*(?:\.|(?:\s*:\s*\w+)?(?:\s*=\s*(?!wretch|await|async|new|function|\[|\{|\(|['"`]|true|false|null|undefined|\d)))/g

  let match
  while ((match = varPattern.exec(code)) !== null) {
    const varName = match[1]
    // Skip common keywords and function names
    if (!["const", "let", "var", "function", "async", "await", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "throw", "try", "catch", "finally", "class", "extends", "implements", "interface", "type", "enum", "namespace", "module", "export", "import", "from", "as", "default"].includes(varName)) {
      variables.add(varName)
    }
  }

  return Array.from(variables)
}

/**
 * Check if code contains specific API patterns
 */
export function detectApiPatterns(code: string): {
  hasWretch: boolean
  hasAddon: boolean
  hasMiddleware: boolean
  hasFetch: boolean
  hasFormData: boolean
  hasAbort: boolean
  hasAuth: boolean
  needsTypes: boolean
} {
  return {
    hasWretch: /\bwretch\s*\(/.test(code),
    hasAddon: /\.(addon|addons)\(/.test(code) || /Addon/.test(code),
    hasMiddleware: /\.(middleware|middlewares)\(/.test(code) || /Middleware/.test(code),
    hasFetch: /\bfetch\s*\(/.test(code),
    hasFormData: /\bFormData\b/.test(code) || /\.formData\(/.test(code),
    hasAbort: /\bAbortController\b/.test(code) || /\.setTimeout\(/.test(code),
    hasAuth: /\.basicAuth\(/.test(code) || /Authorization/.test(code),
    needsTypes: /:\s*\w+/.test(code) || /interface\s+\w+/.test(code) || /type\s+\w+/.test(code),
  }
}

/**
 * Transform snippet code to be testable
 */
export function transformSnippet(snippet: CodeSnippet): string {
  let { code } = snippet

  // Replace example URLs with test APIs
  // code = code.replace(/https?:\/\/example\.com/g, "https://jsonplaceholder.typicode.com")
  // code = code.replace(/https?:\/\/api\.example\.com/g, "https://jsonplaceholder.typicode.com")
  // code = code.replace(/['"]\/api\/[^'"]+['"]/g, "'https://jsonplaceholder.typicode.com/posts/1'")
  // code = code.replace(/['"]\/data['"]/g, "'https://jsonplaceholder.typicode.com/posts/1'")
  // code = code.replace(/['"]\/users\/\d+['"]/g, "'https://jsonplaceholder.typicode.com/users/1'")
  // code = code.replace(/['"]\/posts\/\d+['"]/g, "'https://jsonplaceholder.typicode.com/posts/1'")

  // Handle SvelteKit/Next.js framework-specific examples
  if (/PageServerLoad|GetServerSideProps|req\.headers/.test(code)) {
    // These are framework-specific and can't be tested standalone
    // Wrap in a mock context
    code = `// Framework-specific example - mocked for testing
const fetch = globalThis.fetch
const req = { headers: { cookie: '' } }
${code}`
  }

  // Handle type-only exports
  if (/^export\s+type\s+/.test(code.trim()) || /^export\s+interface\s+/.test(code.trim())) {
    // Type-only exports don't need runtime testing
    return `// Type definition - skipped for runtime testing\n${code}`
  }

  return code
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rootDir = path.resolve(__dirname, "..")
  const snippets = extractAllSnippets(rootDir)
  // eslint-disable-next-line no-console
  console.log(`Found ${snippets.length} code snippets`)

  snippets.forEach((snippet, i) => {
    // eslint-disable-next-line no-console
    console.log(`\n--- Snippet ${i + 1} (${snippet.file}:${snippet.line}) ---`)
    // eslint-disable-next-line no-console
    console.log(snippet.code.substring(0, 100) + (snippet.code.length > 100 ? "..." : ""))
  })
}
