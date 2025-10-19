# Documentation Snippet Testing

Automatically tests code examples from README.md, RECIPES.md, and migration guides to ensure they remain valid.

## Usage

```bash
npm run test:snippets  # Run snippet tests
```

## How It Works

1. Extracts code blocks from markdown files at test runtime
2. Transforms and executes them in sandboxed VM contexts
3. Reports any failures with formatted error output

No generated files are created - everything runs dynamically.

## Skipping Snippets

Add a magic comment before code blocks that shouldn't be tested:

```markdown
<!-- snippet:skip -->
\```js
wretch("example").get()
\```
```

Or with a reason:

```markdown
<!-- snippet:skip Requires custom server -->
\```js
wretch("http://localhost:3000").get()
\```
```

Auto-skips: framework-specific code, type definitions, and deprecated examples.

## Customizing

- **Add markdown files**: Edit `SNIPPET_FILES` array in `test/node/snippets.spec.ts`
- **Add skip rules**: Edit `shouldSkipSnippet()` in `test/node/snippets.spec.ts`

## Test APIs

Uses [JSONPlaceholder](https://jsonplaceholder.typicode.com) and [httpbun](https://httpbun.org) for testing.
