# Documentation Snippet Testing

Automatically tests code examples from README.md, RECIPES.md, and migration guides to ensure they remain valid.

## Usage

```bash
npm run test:snippets  # Run snippet tests
```

## How It Works

1. Extracts code blocks from markdown files at test runtime
2. Parses directives from HTML comments
3. Executes snippets in sandboxed VM contexts
4. Validates outputs, return values, and errors
5. Reports failures with detailed diagnostics

No generated files are created - everything runs dynamically.

## Directives

Directives are special comments that control how snippets are tested. They support:
- **Multi-line directives**: Span across multiple lines
- **Chained directives**: Multiple directives on a single line
- **Parameters**: Pass arguments to directives

### Basic Directives

#### `snippet:skip`

Skip a snippet entirely. Optionally provide a reason:

```markdown
<!-- snippet:skip Requires custom server -->
\```js
wretch("http://localhost:3000").get()
\```
```

#### `snippet:description`

Add a description shown when running tests (useful for understanding what's being tested):

```markdown
<!-- snippet:description Fetches user data from API -->
\```js
const user = await wretch("https://api.example.com/users/1").get().json()
\```
```

Multi-line descriptions are supported:

```markdown
<!-- snippet:description
This example demonstrates how to use the retry middleware
to automatically retry failed requests
-->
\```js
// code here
\```
```

#### `snippet:await`

Automatically wrap code in an async IIFE (useful for top-level await):

```markdown
<!-- snippet:await -->
\```js
wretch("https://api.example.com").get().json()
\```
```

#### `snippet:timeout`

Override the default 5000ms timeout:

```markdown
<!-- snippet:timeout 10000 -->
\```js
await longRunningOperation()
\```
```

### Error Directives

#### `snippet:expect-error`

Assert that a snippet throws an error:

```markdown
<!-- snippet:expect-error -->
\```js
throw new Error("This should fail")
\```
```

Or expect a specific error message:

```markdown
<!-- snippet:expect-error "Network error" -->
\```js
throw new Error("Network error occurred")
\```
```

#### `snippet:expect-no-error`

Explicitly assert that a snippet should not throw (useful for snippets that might be auto-skipped):

```markdown
<!-- snippet:expect-no-error -->
\```js
console.log("This should succeed")
\```
```

### Output Directives

#### `snippet:expect-output`

Assert that console output contains a specific string. Multiple directives can be chained:

```markdown
<!-- snippet:expect-output "GET" snippet:expect-output "200" -->
\```js
console.log("GET /api/users")
console.log("Status: 200")
\```
```

Or use multiple lines:

```markdown
<!-- snippet:expect-output "Success" -->
<!-- snippet:expect-output "Complete" -->
\```js
console.log("Success: Operation complete")
\```
```

#### `snippet:expect-output-regex`

Match console output against a regular expression:

```markdown
<!-- snippet:expect-output-regex /\d+ items/i -->
\```js
console.log("Found 42 items")
\```
```

### Return Value Directives

#### `snippet:expect-return`

Assert that the snippet's return value (from the last expression) contains a specific string:

```markdown
<!-- snippet:expect-return "userId" -->
\```js
const data = await wretch("https://api.example.com/users/1").get().json()
data
\```
```

The code is automatically wrapped in an async IIFE, and the last expression is returned.

#### `snippet:expect-return-json`

Perform complex assertions on return values:

**Simple inclusion** (default):
```markdown
<!-- snippet:expect-return-json "userId" -->
\```js
{ userId: 123, name: "John" }
\```
```

**Exact equality**:
```markdown
<!-- snippet:expect-return-json "equals:123" -->
\```js
123
\```
```

**Deep equality**:
```markdown
<!-- snippet:expect-return-json "deep-equals:{\"name\":\"John\"}" -->
\```js
{ name: "John", age: 30 }
\```
```

**Regex matching**:
```markdown
<!-- snippet:expect-return-json "matches:user-\\d+" -->
\```js
"user-123"
\```
```

**Type checking**:
```markdown
<!-- snippet:expect-return-json "type:object" -->
\```js
{ foo: "bar" }
\```
```

**Property existence**:
```markdown
<!-- snippet:expect-return-json "has-property:userId" -->
\```js
{ userId: 123, name: "John" }
\```
```

**Array operations**:
```markdown
<!-- snippet:expect-return-json "array-length:3" -->
\```js
[1, 2, 3]
\```

<!-- snippet:expect-return-json "array-contains:2" -->
\```js
[1, 2, 3]
\```
```

**JSON path** (for nested values):
```markdown
<!-- snippet:expect-return-json path="user.name" value="John" -->
\```js
{ user: { name: "John", age: 30 } }
\```
```

#### `snippet:return-statement`

Specify a custom variable to return when the snippet ends with a variable assignment. Useful when code ends with `const result = ...`:

```markdown
<!-- snippet:return-statement result -->
<!-- snippet:expect-return "userId" -->
\```js
const result = wretch("https://api.example.com/users/1").get().json()
\```
```

This automatically adds `return result` after the last statement, making the value available for assertions.

### Chaining Directives

Multiple directives can be combined on one line or across multiple lines:

```markdown
<!-- snippet:await snippet:timeout 10000 snippet:expect-output "Success" -->
\```js
const result = await wretch("https://api.example.com").get().json()
console.log("Success")
\```
```

Or:

```markdown
<!-- snippet:description Fetches and validates user data -->
<!-- snippet:await -->
<!-- snippet:timeout 10000 -->
<!-- snippet:expect-return "userId" -->
\```js
const user = await wretch("https://api.example.com/users/1").get().json()
user
\```
```

## Architecture

The framework is designed as a collection of independent, reusable modules:

```
test/snippets/
├── types.ts              # Core type definitions (no dependencies)
├── parser.ts             # Directive parser (handles multi-line, chained directives)
├── extractor.ts          # Snippet extraction from markdown
├── executor/             # Modular execution system
│   ├── console.ts        # Mock console implementation
│   ├── transpiler.ts     # TypeScript compilation
│   ├── transformer.ts    # Code transformations
│   └── sandbox.ts        # VM execution
├── executor.ts           # VM-based code execution orchestrator
├── directives/           # Type-safe directive system
│   ├── types.ts          # Directive type definitions
│   ├── skip.ts           # Control directives
│   ├── description.ts    # Documentation directives
│   ├── await.ts          # Transform directives
│   ├── timeout.ts        # Config directives
│   ├── expectError.ts    # Assertion directives
│   └── [etc...]          # Additional directives
├── assertions.ts         # Assertion system (includes, equals, JSON path, etc.)
├── formatter.ts          # Error formatting and diagnostics
├── runner.ts             # Main orchestrator
├── plugin.ts             # Plugin system architecture
├── config.ts             # Configuration file system
├── examples/             # Example plugins
│   ├── logging-plugin.ts    # Logging plugin example
│   ├── benchmark-plugin.ts  # Benchmark plugin example
│   └── README.md           # Plugin documentation
├── index.ts              # Public API exports
└── snippets.spec.ts      # Test runner (wretch-specific integration)
```

### Key Design Principles

1. **Zero coupling**: No dependencies on wretch-specific code
2. **Modular**: Each component has a single responsibility
3. **Extensible**: Plugin system for custom functionality
4. **Type-safe**: Full TypeScript support
5. **Clear errors**: Detailed diagnostics when tests fail
6. **Configurable**: Support for config files and programmatic setup

## Customizing

### Adding Custom Directives

Custom directives are added through plugins. Here's an example:

```typescript
import { SnippetRunner } from './snippets/index.js'
import type { Plugin, ControlDirective } from './snippets/plugin.js'

// Create a custom directive
const myDirective: ControlDirective = {
  type: 'control',
  name: 'my-directive',
  description: 'My custom directive',
  handler: (snippet) => {
    console.log(`Processing custom directive for ${snippet.file}:${snippet.line}`)
    return null // Return null to continue execution, or { skip: true, reason: '...' } to skip
  }
}

// Create a plugin that registers the directive
const myPlugin: Plugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  directives: [myDirective],
  hooks: {}
}

// Use the plugin
const runner = new SnippetRunner({
  plugins: [myPlugin]
})

await runner.initialize()
```

### Custom Skip Logic

```typescript
const runner = new SnippetRunner({
  shouldSkip: (snippet) => {
    if (snippet.code.includes('SKIP_ME')) {
      return { skip: true, reason: 'Contains SKIP_ME marker' }
    }
    return { skip: false }
  }
})
```

### Adding Files

Edit the `SNIPPET_FILES` array in `snippets.spec.ts`:

```typescript
const SNIPPET_FILES = [
  "README.md",
  "RECIPES.md",
  "MIGRATION_V2_V3.md",
  "docs/ADVANCED.md", // Add new files here
]
```

## Plugin System

The snippet testing framework includes a powerful plugin system that allows you to extend functionality without modifying core code.

### What are Plugins?

Plugins are self-contained modules that can:
- Add custom directives (like `snippet:benchmark`, `snippet:tag`, etc.)
- Hook into the test lifecycle (before/after execution)
- Modify test behavior and results
- Collect metrics and generate reports
- Transform code or context before execution

### Using Plugins

```typescript
import { SnippetRunner } from './snippets/index.js'
import { benchmarkPlugin, loggingPlugin } from './snippets/examples/index.js'

const runner = new SnippetRunner({
  plugins: [benchmarkPlugin, loggingPlugin]
})

// Initialize plugins
await runner.initialize()

// Run tests with plugins active
const results = await runner.runSnippets(snippets)

// Cleanup plugins
await runner.cleanup()
```

### Example Plugins

The framework includes two example plugins demonstrating different capabilities:

#### 1. Logging Plugin

Logs test execution for debugging and monitoring:

```typescript
import { createLoggingPlugin } from './snippets/examples/logging-plugin.js'

const logger = createLoggingPlugin({
  logStart: true,      // Log when tests start
  logComplete: true,   // Log when tests complete
  logErrors: true,     // Log errors
  mode: 'console'      // 'console' or 'collect'
})

const runner = new SnippetRunner({ plugins: [logger] })
```

#### 2. Benchmark Plugin

Adds a `snippet:benchmark` directive to measure execution time:

```typescript
import { createBenchmarkPlugin } from './snippets/examples/benchmark-plugin.js'

const benchmark = createBenchmarkPlugin({
  threshold: 100,      // Warn if > 100ms
  printPerTest: false, // Print per-test results
  printSummary: true   // Print summary report
})

const runner = new SnippetRunner({ plugins: [benchmark] })
```

Use in markdown:

```markdown
<!-- snippet:benchmark -->
<!-- snippet:await -->
<!-- snippet:expect-return "result" -->
\```typescript
const data = await expensiveOperation()
data
\```
```

### Available Plugin Hooks

Plugins can implement these lifecycle hooks:

- **`onInit()`** - Called before any snippets are processed
- **`onBeforeExtract(filePath, content)`** - Called before extracting from a file
- **`onAfterExtract(filePath, snippets)`** - Called after extraction
- **`onBeforeRun(snippet, context)`** - Called before running a snippet
- **`onAfterRun(snippet, result)`** - Called after execution
- **`onTestComplete(testResult)`** - Called after assertions complete
- **`onComplete(results)`** - Called after all tests finish
- **`onError(error, snippet?)`** - Called when errors occur

### Creating Custom Plugins

```typescript
import type { Plugin, ControlDirective } from './snippets/index.js'

// Create a custom directive
const myDirective: ControlDirective = {
  type: 'control',
  name: 'myDirective',
  handler: (snippet, directive) => {
    // Return null to continue, or { skip: true, reason: '...' } to skip
    return null
  }
}

// Create the plugin
export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',

  // Register custom directives
  directives: [myDirective],

  // Lifecycle hooks
  hooks: {
    onInit: async () => {
      console.log('Plugin initialized')
    },

    onBeforeRun: async (snippet, context) => {
      // Modify context if needed
      return undefined
    },

    onComplete: async (results) => {
      console.log(`Completed ${results.length} tests`)
    }
  }
}
```

See [examples/README.md](./examples/README.md) for detailed plugin documentation and examples.

## Configuration Files

You can configure the snippet testing system using configuration files instead of code.

### Supported Config Files

The framework looks for these files (in order):

1. `.snippet-testrc.json`
2. `.snippet-testrc.js`
3. `snippet-test.config.json`
4. `snippet-test.config.js`

### JSON Configuration

```json
{
  "files": ["README.md", "docs/**/*.md"],
  "languages": ["typescript", "javascript"],
  "includeUndirected": false,
  "timeout": 5000,
  "showSuccess": true,
  "showSkipped": false,
  "verbose": false,
  "plugins": ["./my-plugin.js"],
  "globals": {
    "API_URL": "https://api.example.com"
  }
}
```

### JavaScript Configuration

```javascript
// snippet-test.config.js
export default {
  files: ["README.md", "docs/**/*.md"],
  languages: ["typescript", "javascript"],
  timeout: 5000,

  // Load plugins
  plugins: ["./my-plugin.js"],

  // Custom module resolver
  moduleResolver: async (specifier) => {
    if (specifier === 'my-lib') {
      return await import('./lib/index.js')
    }
  },

  // Global variables available in snippets
  globals: {
    API_URL: process.env.API_URL || "https://api.example.com"
  }
}
```

### Loading Configuration

```typescript
import { loadConfig, SnippetRunner } from './snippets/index.js'

// Automatically discover and load config from current directory
const config = await loadConfig()

// Or load from specific path
const config = await loadConfig('/path/to/config.json')

// Use config with runner
const runner = new SnippetRunner(config)
```

### Configuration Options

| Option              | Type                  | Default                        | Description                         |
| ------------------- | --------------------- | ------------------------------ | ----------------------------------- |
| `files`             | `string[]`            | `[]`                           | Glob patterns for files to test     |
| `languages`         | `string[]`            | `['typescript', 'javascript']` | Code block languages to extract     |
| `includeUndirected` | `boolean`             | `false`                        | Include snippets without directives |
| `timeout`           | `number`              | `5000`                         | Default execution timeout (ms)      |
| `showSuccess`       | `boolean`             | `true`                         | Show successful tests               |
| `showSkipped`       | `boolean`             | `false`                        | Show skipped tests                  |
| `verbose`           | `boolean`             | `false`                        | Verbose output                      |
| `plugins`           | `Plugin[]`            | `[]`                           | Plugin instances to load            |
| `globals`           | `Record<string, any>` | `{}`                           | Global variables for snippets       |
| `moduleResolver`    | `Function`            | `undefined`                    | Custom module resolver              |
| `shouldSkip`        | `Function`            | `undefined`                    | Custom skip predicate               |

### Merging Configurations

Configurations can be merged programmatically:

```typescript
import { mergeConfigs } from './snippets/index.js'

const baseConfig = { timeout: 5000, showSuccess: true }
const userConfig = { timeout: 10000, verbose: true }

// Later config takes precedence
const merged = mergeConfigs(baseConfig, userConfig)
// Result: { timeout: 10000, showSuccess: true, verbose: true }
```

## Programmatic Usage

```typescript
import { SnippetExtractor, SnippetRunner } from './snippets/index.js'
import { readFile } from 'fs/promises'

// Extract snippets
const extractor = new SnippetExtractor()
const snippets = await extractor.extractFromFile(
  'README.md',
  (path) => readFile(path, 'utf-8')
)

// Run tests
const runner = new SnippetRunner({
  showSuccess: true,
  verbose: true,
})

const results = await runner.runSnippets(snippets, {
  globals: { myCustomGlobal: 'value' }
})

// Print summary
runner.printSummary(results)

// Handle failures
const failed = results.filter(r => !r.passed && !r.skipped)
if (failed.length > 0) {
  process.exit(1)
}
```

## Test APIs

Uses [JSONPlaceholder](https://jsonplaceholder.typicode.com) and [httpbingo](https://httpbingo.org) for testing live HTTP requests.

## Future Extraction

This framework is designed to be extracted as a standalone npm package:

```
@wretch/snippet-testing
```

To extract:
1. Copy `test/snippets/` directory (excluding `snippets.spec.ts`)
2. Add `package.json` with minimal dependencies (`typescript` only)
3. Update import paths to be package-relative
4. Add integration guide for consumers

Dependencies:
- `typescript` (for transpilation) - could be made optional if only testing JS
- `node:vm`, `node:test` (built-in Node.js modules)

That's it! No other dependencies needed.
