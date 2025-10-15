# Documentation Snippet Testing

Automatically tests code examples from README.md, RECIPES.md, and migration guides to ensure they remain valid.

## Usage

```bash
npm run test:snippets:generate  # Extract & generate tests
npm run test:snippets           # Generate and run tests
```

## How It Works

1. Extracts code blocks from markdown files
2. Transforms them (adds imports, replaces URLs, wraps in async context)
3. Generates individual test files in `test/generated/`
4. Runs them in sandboxed VM contexts

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

Auto-skips: pseudo-code with `// ...`, framework-specific code, type definitions, deprecated examples.

## Customizing

- **Add markdown files**: Edit `markdownFiles` array in `extractSnippets.ts`
- **Add URL patterns**: Edit `transformSnippet()` in `extractSnippets.ts`
- **Add import detection**: Edit `generateImports()` in `generateSnippetTests.ts`
- **Add skip rules**: Edit `shouldSkipSnippet()` in `generateSnippetTests.ts`

## Test APIs

Uses [JSONPlaceholder](https://jsonplaceholder.typicode.com) and [httpbun](https://httpbun.org) for testing. Example URLs are automatically replaced.
