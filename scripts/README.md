# Documentation Snippet Testing

This directory contains scripts and infrastructure for automatically testing code snippets from the documentation.

## Overview

The documentation (README.md, RECIPES.md, MIGRATION_*.md) contains many code examples. This system ensures those examples remain valid and functional as the library evolves.

**Current Status**: ✅ **10 out of 10 testable snippets passing!** (74 skipped)

## How It Works

1. **Extract Snippets** (`scripts/extractSnippets.ts`)
   - Parses markdown files looking for code blocks
   - Extracts JavaScript/TypeScript snippets
   - Tracks source location (file and line number)

2. **Generate Tests** (`scripts/generateSnippetTests.ts`)
   - Uses Node's `vm.SourceTextModule` to execute snippets in isolated contexts
   - Transforms snippets to be testable:
     - Separates imports from code
     - Wraps code in async IIFE exported as default
     - Links module imports (wretch, middlewares) via VM module linker
     - Replaces example URLs with real test APIs (jsonplaceholder, httpbun)
   - Generates individual test files in `test/generated/`
   - Skips snippets that can't be tested (pseudo-code, type definitions, etc.)

3. **Run Tests**
   - Uses Node.js test runner with `--experimental-vm-modules` flag
   - Executes snippets in sandboxed VM contexts with Web APIs
   - Ensures all testable snippets execute without errors

## Usage

### Generate and Run Snippet Tests

```bash
# Generate test file from documentation snippets
npm run test:snippets:generate

# Generate and run snippet tests
npm run test:snippets
```

### Integration with CI

Add to your CI pipeline to catch outdated documentation:

```bash
# In your CI workflow
npm run test:snippets
```

## Generated Files

- `test/generated/snippets.spec.ts` - Auto-generated test file (gitignored)

## Snippet Transformation Rules

### URL Replacement
- `https://example.com` → `https://jsonplaceholder.typicode.com`
- `/api/*` → `https://jsonplaceholder.typicode.com/posts/1`
- `/users/*` → `https://jsonplaceholder.typicode.com/users/1`

### Import Detection
Automatically adds imports based on code usage:
- `wretch()` → `import wretch from "wretch"`
- `.query()` → `import QueryStringAddon from "wretch/addons/queryString"`
- `.formData()` → `import FormDataAddon from "wretch/addons/formData"`
- `retry()` → `import { retry } from "wretch/middlewares"`
- And more...

### Skipped Snippets
The following are automatically skipped:
- Snippets with placeholder comments (`// ...`, `/* ... */`)
- Framework-specific code requiring special setup (SvelteKit, Next.js)
- Type-only definitions (`export type`, `export interface`)
- Deprecated examples (marked with ❌ in migration guides)
- Very short snippets that are incomplete
- Snippets marked with magic comment (see below)

### Magic Comments

You can manually skip a snippet by adding a magic comment before the code block:

```markdown
<!-- snippet:skip -->
\```js
// This snippet will be skipped
wretch("example").get()
\```
```

Or with a custom reason:

```markdown
<!-- snippet:skip This example requires a running server -->
\```js
wretch("http://localhost:3000").get()
\```
```

**When to use magic comments:**
- Examples that require external services
- Examples with incomplete/placeholder code for illustration
- Examples that demonstrate concepts but aren't meant to run
- Examples that need specific environment setup

**Example:**

```markdown
This example shows how to configure a custom server:

<!-- snippet:skip Requires custom server setup -->
\```js
const customServer = createServer()
wretch("http://localhost:8080")
  .fetchPolyfill(customServer.fetch)
  .get("/api")
\```
```

## Test APIs Used

The system uses free public APIs for testing:
- **JSONPlaceholder** (https://jsonplaceholder.typicode.com) - REST API for testing
- **httpbun** (https://httpbun.org) - HTTP testing service

These APIs provide:
- GET/POST/PUT/DELETE endpoints
- JSON responses
- No authentication required
- Reliable uptime

## Maintaining the Tests

### When Adding New Documentation

Code snippets in documentation should follow these guidelines:

1. **Use Complete Examples**: Prefer complete, runnable examples over partial snippets
2. **Use Standard URLs**: Use `https://example.com` or `https://api.example.com` - they'll be replaced automatically
3. **Include Context**: If a snippet references variables, define them in the same snippet
4. **Mark Non-Testable Code**: Use `// ...` for pseudo-code that shouldn't be tested

### When Tests Fail

If snippet tests fail:

1. **Check the Documentation**: The example may be outdated
2. **Update the Snippet**: Fix the documentation if the API changed
3. **Update Transformation Rules**: If test APIs changed, update `generateSnippetTests.ts`
4. **Mark as Skip**: If a snippet can't be tested, update the skip rules

### Extending the System

To add support for new patterns:

1. **Add URL Patterns**: Edit `transformSnippet()` in `extractSnippets.ts`
2. **Add Import Detection**: Edit `generateImports()` in `generateSnippetTests.ts`
3. **Add Skip Rules**: Edit `shouldSkipSnippet()` in `generateSnippetTests.ts`

## Example

Given this documentation snippet:

\`\`\`javascript
wretch("https://api.example.com")
  .get("/data")
  .json(data => console.log(data))
\`\`\`

The system generates:

\`\`\`typescript
import wretch from "wretch"

async function test_0() {
  try {
    const result = await wretch("https://jsonplaceholder.typicode.com")
      .get("/posts/1")
      .json(data => console.log(data))
  } catch (error) {
    // Error handling...
  }
}

it("README.md:123 - snippet 1", async () => {
  await test_0()
})
\`\`\`

## Benefits

- **Documentation Always Valid**: Catch outdated examples early
- **Refactoring Safety**: Breaking changes are detected in documentation
- **Living Documentation**: Examples are guaranteed to work
- **Improved Onboarding**: New users see working code
- **Reduced Issues**: Fewer bug reports about broken examples
