# Example Plugins

This directory contains example plugins that demonstrate how to extend the snippet testing framework.

## Available Example Plugins

### 1. Logging Plugin (`logging-plugin.ts`)

A plugin that logs test execution events for debugging and monitoring purposes.

**Features:**
- Logs test start, completion, and errors
- Two modes: "console" (prints to console) or "collect" (stores in array)
- Configurable verbosity
- Demonstrates all plugin lifecycle hooks

**Usage:**

```typescript
import { loggingPlugin, createLoggingPlugin } from './snippets/examples/logging-plugin.js'
import { SnippetRunner } from './snippets/index.js'

// Use the default instance
const runner = new SnippetRunner({
  plugins: [loggingPlugin]
})

// Or create a customized instance
const customLogger = createLoggingPlugin({
  logStart: true,
  logComplete: true,
  logErrors: true,
  mode: 'console'
})

const runner2 = new SnippetRunner({
  plugins: [customLogger]
})
```

**Options:**
- `logStart` (boolean): Log when snippets start executing
- `logComplete` (boolean): Log when snippets complete
- `logErrors` (boolean): Log errors
- `mode` ('console' | 'collect'): Output mode

### 2. Benchmark Plugin (`benchmark-plugin.ts`)

A plugin that adds performance measurement capabilities with a custom `snippet:benchmark` directive.

**Features:**
- Adds `snippet:benchmark` directive to measure execution time
- Configurable threshold for slow snippet detection
- Summary report with statistics
- Per-test and summary output options
- Demonstrates custom directive registration

**Usage:**

```typescript
import { benchmarkPlugin, createBenchmarkPlugin } from './snippets/examples/benchmark-plugin.js'
import { SnippetRunner } from './snippets/index.js'

// Use the default instance
const runner = new SnippetRunner({
  plugins: [benchmarkPlugin]
})

// Or create a customized instance
const customBenchmark = createBenchmarkPlugin({
  threshold: 50,        // Warn if execution takes > 50ms
  printPerTest: true,   // Print timing for each test
  printSummary: true,   // Print summary at end
  formatter: (result) => `${result.file} took ${result.duration}ms`
})

const runner2 = new SnippetRunner({
  plugins: [customBenchmark]
})
```

**Directive Usage in Markdown:**

````markdown
<!-- snippet:benchmark -->
<!-- snippet:expect-return 42 -->
```typescript
function expensiveOperation() {
  // This snippet's execution time will be measured
  return 42;
}
```
````

**Options:**
- `threshold` (number): Milliseconds threshold for warnings (default: 100)
- `printPerTest` (boolean): Print results after each test (default: false)
- `printSummary` (boolean): Print summary report at end (default: true)
- `formatter` (function): Custom result formatter

**Output Example:**

```
📊 BENCHMARK SUMMARY
============================================================

Top 5 Slowest Snippets:
⚠️  1. ⏱️  README.md:5 (Complex operation) - 125.42ms
   2. ⏱️  RECIPES.md:12 - 85.23ms
   3. ⏱️  README.md:15 - 45.67ms

Statistics:
  Total snippets: 10
  Total time: 456.78ms
  Average: 45.68ms
  Min: 12.34ms
  Max: 125.42ms
  Exceeded threshold (100ms): 1
============================================================
```

## Creating Your Own Plugin

Plugins are objects that implement the `Plugin` interface. Here's a minimal example:

```typescript
import type { Plugin } from '../plugin.js'

export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Does something useful',

  // Optional: Register custom directives
  directives: [
    {
      type: 'control',
      name: 'myDirective',
      description: 'My custom directive',
      handler: (snippet, directive) => {
        // Return null to continue, or { skip: true, reason: '...' } to skip
        return null
      }
    }
  ],

  // Optional: Lifecycle hooks
  hooks: {
    onInit: async () => {
      console.log('Plugin initialized')
    },

    onBeforeRun: async (snippet, context) => {
      // Modify context or return undefined to continue
      return undefined
    },

    onAfterRun: async (snippet, result) => {
      // Modify result or return undefined to keep original
      return undefined
    },

    onTestComplete: async (testResult) => {
      // Modify test result or return undefined
      return undefined
    },

    onComplete: async (results) => {
      console.log(`Completed ${results.length} tests`)
    },

    onError: async (error, snippet) => {
      console.error('Error:', error.message)
    }
  },

  // Optional: Plugin lifecycle
  onLoad: async () => {
    console.log('Plugin loaded')
  },

  onUnload: async () => {
    console.log('Plugin unloaded')
  }
}
```

## Available Plugin Hooks

### Lifecycle Hooks (via `hooks` property)

1. **`onInit()`** - Called before any snippets are processed
2. **`onBeforeExtract(filePath, content)`** - Called before extracting from a file
3. **`onAfterExtract(filePath, snippets)`** - Called after extraction
4. **`onBeforeRun(snippet, context)`** - Called before running a snippet
5. **`onAfterRun(snippet, result)`** - Called after execution
6. **`onTestComplete(testResult)`** - Called after assertions
7. **`onComplete(results)`** - Called after all tests finish
8. **`onError(error, snippet?)`** - Called on errors

### Plugin Lifecycle (direct properties)

- **`onLoad()`** - Called when plugin is registered
- **`onUnload()`** - Called when plugin is unregistered

## Custom Directives

Plugins can register four types of directives:

### 1. Control Directives

Control test flow (skip, etc.):

```typescript
{
  type: 'control',
  name: 'myControl',
  handler: (snippet, directive) => {
    if (shouldSkip(snippet)) {
      return { skip: true, reason: 'Not ready' }
    }
    return null
  }
}
```

### 2. Assertion Directives

Validate execution results:

```typescript
{
  type: 'assertion',
  name: 'expectCustom',
  handler: (executionResult, directive) => {
    const passed = validate(executionResult.returnValue)
    return {
      passed,
      message: passed ? undefined : 'Validation failed',
      actual: executionResult.returnValue,
      expected: directive.args[0]
    }
  }
}
```

### 3. Transform Directives

Modify code before execution:

```typescript
{
  type: 'transform',
  name: 'wrapInTry',
  handler: (snippet, directive) => {
    return {
      code: `try {\n${snippet.code}\n} catch (e) { console.error(e) }`,
      modified: true
    }
  }
}
```

### 4. Config Directives

Modify execution context:

```typescript
{
  type: 'config',
  name: 'withTimeout',
  handler: (snippet, directive, context) => {
    return {
      timeout: parseInt(directive.args[0])
    }
  }
}
```

## Using Plugins in Config Files

You can also load plugins via configuration:

```json
{
  "plugins": [
    "./path/to/my-plugin.js"
  ]
}
```

## Best Practices

1. **State Management**: Store plugin state in closures or class properties
2. **Error Handling**: Always handle errors gracefully in hooks
3. **Performance**: Keep hooks fast to avoid slowing down tests
4. **Return Values**: Return `undefined` from hooks when you don't want to modify data
5. **Directive Names**: Use descriptive, unique names for custom directives
6. **Documentation**: Document your plugin's options and behavior

## Next Steps

- Check the [main README](../README.md) for more documentation
- Read the [plugin system architecture](../plugin.ts)
- Explore directive types in [directives/types.ts](../directives/types.ts)
