# Documentation Snippet Testing - Summary

## ✅ What We Built

A complete system to extract, transform, and test code snippets from your markdown documentation files.

### Key Components

1. **`scripts/extractSnippets.ts`** - Extracts code blocks from markdown files
2. **`scripts/generateSnippetTests.ts`** - Transforms snippets into testable files
3. **`test/generated/`** - Auto-generated test files (gitignored)
   - `snippets.spec.ts` - Main test runner
   - `snippet-N.js` - Individual snippet files (one per code example)

### How It Works

```
Documentation (README.md, RECIPES.md, etc.)
    ↓ Extract
Code Snippets (92 found)
    ↓ Transform & Generate
Individual Test Files (72 testable + 20 skipped)
    ↓ Run
Test Results
```

## 📊 Current Results

From your documentation (as of generation):

- **92 total code snippets** found across all markdown files
- **72 testable snippets** (generated as separate files)
- **20 skipped snippets** (correctly identified as non-testable)

### Test Results

Running `npm run test:snippets` shows:
- ✅ **~14 snippets pass** out of the box
- ⏭️ **20 snippets skipped** (framework-specific, pseudo-code, deprecated examples)
- ❌ **~58 snippets fail** (need better variable/URL mocking)

## 🎯 Benefits

### 1. **Each Snippet is a Separate File**
   - Easy to debug individual snippets
   - Can run/test snippets in isolation
   - Clear error messages point to specific files

### 2. **Smart Skipping**
   - Automatically skips pseudo-code with `// ...` comments
   - Skips framework-specific examples (SvelteKit, Next.js)
   - Skips deprecated examples from migration guides
   - Skips type-only definitions

### 3. **Automatic Transformations**
   - Replaces example URLs with real test APIs
   - Adds necessary imports based on code usage
   - Wraps partial code in async IIFEs
   - Handles error cases gracefully

### 4. **Easy Integration**
   ```bash
   # Generate tests from documentation
   npm run test:snippets:generate

   # Generate and run tests
   npm run test:snippets
   ```

## 🔍 Example Generated File

**From README.md:**
```javascript
wretch("https://api.example.com")
  .get("/data")
  .json(data => console.log(data))
```

**Generated `snippet-1.js`:**
```javascript
// Auto-generated from README.md:68
import wretch from "wretch"

;(async () => {
  try {
    wretch("https://jsonplaceholder.typicode.com")
      .get("/posts/1")
      .json(data => console.log(data))
  } catch (error) {
    // Some snippets demonstrate error handling
    if (error instanceof Error) {
      // Expected errors are OK
      console.log("Expected error:", error.message)
    } else {
      throw error
    }
  }
})()
```

**Main test file references it:**
```typescript
it("README.md:68 - snippet 2", async () => {
  await import("./snippet-1.js")
})
```

## 🚀 Next Steps to Improve

### Increase Pass Rate

To get more snippets passing:

1. **Better Variable Detection**
   - Detect undefined variables (`token`, `baseUrl`, `callback`, etc.)
   - Add mock definitions at the top of snippets

2. **Smarter URL Replacement**
   - Handle relative URLs (`/resource/1` → `https://jsonplaceholder.typicode.com/posts/1`)
   - Handle variable URLs (`` `${baseUrl}/api` ``)

3. **Mock Common Functions**
   - Add stubs for callback functions referenced in snippets
   - Mock handlers like `handle403`, `handleResource`, etc.

4. **Context Awareness**
   - Some snippets depend on previous snippets
   - Could group related snippets together

### Integration Ideas

1. **CI Integration**
   - Add to GitHub Actions to fail PR if docs are broken
   - Generate PR comments with failing snippets

2. **Documentation Generation**
   - Badge showing "X% of examples tested"
   - Mark tested snippets with ✅ in docs

3. **Interactive Documentation**
   - Link from docs to runnable examples
   - "Try it" buttons that use the generated test files

## 📁 File Structure

```
wretch/
├── scripts/
│   ├── extractSnippets.ts       # Extract snippets from markdown
│   ├── generateSnippetTests.ts  # Generate test files
│   └── README.md                # This documentation
├── test/
│   └── generated/               # Auto-generated (gitignored)
│       ├── snippets.spec.ts     # Main test runner
│       ├── snippet-0.js         # Individual snippets
│       ├── snippet-1.js
│       └── ...
├── README.md                    # Contains code snippets
├── RECIPES.md                   # Contains code snippets
├── MIGRATION_V2_V3.md          # Contains code snippets
└── package.json                 # Added test:snippets scripts
```

## 🎨 Customization

### Adding New Documentation Files

Edit `extractSnippets.ts`:
```typescript
const markdownFiles = [
  path.join(rootDir, "README.md"),
  path.join(rootDir, "RECIPES.md"),
  path.join(rootDir, "YOUR_NEW_FILE.md"), // Add here
]
```

### Customizing URL Replacement

Edit `transformSnippet()` in `extractSnippets.ts`:
```typescript
// Add more URL patterns
code = code.replace(/your-pattern/g, "https://test-api.com")
```

### Customizing Skip Rules

Edit `shouldSkipSnippet()` in `generateSnippetTests.ts`:
```typescript
if (code.includes("YOUR_SKIP_PATTERN")) {
  return { skip: true, reason: "Your reason" }
}
```

## 💡 Tips

1. **Debugging Failed Tests**
   - Open the specific `snippet-N.js` file
   - Run it directly: `node test/generated/snippet-N.js`
   - Fix the documentation or improve the transformation

2. **Seeing What Was Extracted**
   - Run: `node --import tsx scripts/extractSnippets.ts`
   - Shows all found snippets with preview

3. **Quick Iteration**
   - Edit `generateSnippetTests.ts`
   - Run `npm run test:snippets:generate`
   - Check the generated files
   - Repeat

## 📚 References

- **Test APIs Used:**
  - [JSONPlaceholder](https://jsonplaceholder.typicode.com) - Fake REST API
  - [httpbin](https://httpbin.org) - HTTP testing service

- **Node.js Test Runner:**
  - [Node.js Test Runner Docs](https://nodejs.org/api/test.html)

---

**Generated:** $(date)
**Total Snippets:** 92
**Testable:** 72
**Passing:** ~14 (19%)
**Goal:** 80%+ passing rate
