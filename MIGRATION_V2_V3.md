# :memo: Migration Guide: Wretch v2 to v3

This guide outlines the breaking changes and migration steps required when upgrading from Wretch v2 to v3.

## 👍 Benefits of v3

- **Smaller bundle size** - No polyfill code included
- **Better performance** - Native APIs are optimized
- **Improved type safety** - `.customError()` provides full typing
- **Simpler codebase** - Less abstraction, fewer edge cases
- **Modern defaults** - Better retry behavior out of the box
- **New features** - Upload progress monitoring

## 📋 Complete Migration Checklist

- [ ] Update to Node.js 22 or higher
- [ ] Remove polyfill dependencies (`node-fetch`, `form-data`, etc.)
- [ ] Replace `.polyfills()` calls with `.fetchPolyfill()` (if using custom fetch)
- [ ] Remove `wretch.polyfills()` static method calls
- [ ] Remove `wretch.options()` static method calls - use per-instance config
- [ ] Replace `.errorType()` with `.customError()` for error parsing
- [ ] Remove `wretch.errorType()` static method calls
- [ ] Review retry middleware behavior (now skips 4xx by default)
- [ ] Update error handlers to use `.customError()` for typed error properties
- [ ] Update addon method calls to use options objects:
  - [ ] `.query(qp, replace, omitUndefinedOrNullValues)` → `.query(qp, { replace, omitUndefinedOrNullValues })`
  - [ ] `.formData(obj, recursive)` → `.formData(obj, { recursive })`
  - [ ] `.setTimeout(time, controller)` → `.setTimeout(time, { controller })`
- [ ] Test your application thoroughly

## :fire: Breaking Changes

### 1. Node.js Version Requirement

**Wretch v3 requires Node.js 22 or higher.**

Node.js 22+ includes native support for all required Web APIs out of the box:
- `fetch`
- `FormData`
- `URLSearchParams`
- `AbortController`
- `URL`
- `performance` and `PerformanceObserver`

This allows Wretch to drop all polyfill code, resulting in a smaller bundle size and better performance.

### 2. Removed: `.polyfills()` Method

The `.polyfills()` method has been **removed**. Use `.fetchPolyfill()` instead for custom fetch implementations.

```js
// ❌ Before (v2)
wretch().polyfills({
  fetch: customFetch,
  FormData: FormDataPolyfill,
  URLSearchParams: URLSearchParamsPolyfill
})

// ✅ After (v3)
wretch().fetchPolyfill(customFetch)
// FormData, URLSearchParams, etc. are now always native
```

### 3. Removed: Global Static Configuration Methods

All global static configuration methods have been **removed** to reduce bundle size. Use per-instance configuration instead.

#### `wretch.polyfills()` → Per-instance `.fetchPolyfill()`

```js
// ❌ Before (v2)
wretch.polyfills({ fetch: customFetch })

// ✅ After (v3)
const api = wretch("https://api.example.com")
  .fetchPolyfill(customFetch)
```

#### `wretch.options()` → Per-instance `.options()`

```js
// ❌ Before (v2)
wretch.options({ credentials: "same-origin" })

// ✅ After (v3)
const api = wretch("https://api.example.com", { credentials: "same-origin" })
// or
const api = wretch().options({ credentials: "same-origin" })
```

#### `wretch.errorType()` → Removed (see section 4)

### 4. Removed: `.errorType()` Method

The `.errorType()` method has been **removed** and replaced with `.customError()` for better type safety and flexibility.

#### Old Behavior (v2)

```js
// ❌ No longer available in v3
wretch("http://server/error")
  .errorType("json")
  .get()
  .res()
  .catch(error => {
    console.log(error.json) // Parsed error body
  })
```

#### New Approach (v3)

Use `.customError()` to parse and transform errors with full type safety:
<!-- snippet:skip Needs fixing -->

```js
// ✅ v3 approach
interface ApiError {
  code: number
  message: string
  details?: string
}

const api = wretch("http://server")
  .customError<ApiError>(async (error, response, request) => {
    return { ...error, json: await response.json() }
  })

api.get("/error")
  .badRequest(error => {
    console.log(error.json)
  })
  .json()
```

**Key advantages of `.customError()`:**
- Full TypeScript type safety for custom error properties
- More flexible - transform errors however you need
- Works consistently across all error handlers

### 5. Changed: Retry Middleware Default Behavior

The retry middleware now **skips retrying 4xx client errors by default**.

#### Old Behavior (v2)
```js
import { retry } from "wretch/middlewares"

// Retried ALL non-2xx responses (including 4xx)
wretch().middlewares([retry()])
```

#### New Behavior (v3)
```js
import { retry } from "wretch/middlewares"

// Only retries 5xx server errors and network errors
// Does NOT retry 4xx client errors
wretch().middlewares([retry()])
```

#### Migration Options

**Option 1:** Keep the new default (recommended)
```js
import { retry } from "wretch/middlewares"

// Accept the new behavior - only retry server errors
wretch().middlewares([retry()])
```

**Option 2:** Restore v2 behavior
```js
import { retry } from "wretch/middlewares"

// Retry ALL non-2xx responses (including 4xx)
wretch().middlewares([
  retry({
    until: (response, error) => response && response.ok
  })
])
```

#### Why This Change?

Client errors (4xx) usually indicate problems with the request itself (bad input, authentication, etc.) that won't be fixed by retrying. Server errors (5xx) are more likely to be transient and benefit from retries.

### 6. New Feature: Upload Progress Monitoring

v3 adds upload progress monitoring support through the Progress addon.

```js
import ProgressAddon from "wretch/addons/progress"
import FormDataAddon from "wretch/addons/formData"

await wretch("https://httpbun.org/post")
  .addon([ProgressAddon(), FormDataAddon])
  .formData({ file })
  .onUpload((loaded, total) => {
    console.log(`Upload: ${(loaded / total * 100).toFixed(0)}%`)
  })
  .post()
  .json()
```

**Browser Limitations:**
- **Firefox**: Does not support request body streaming (upload progress won't work)
- **Chrome/Chromium**: Requires HTTPS connections for upload streaming
- **Node.js**: Full support for both HTTP and HTTPS

### 7. Removed: `wretch.errorType()` Static Method

```js
// ❌ Before (v2)
wretch.errorType("json")

// ✅ After (v3)
// Use per-instance .customError() instead (see section 4)
```

### 8. Changed: Addon Optional Parameters Consolidated into Options Objects

Three addon methods now use options objects instead of positional parameters for better long-term API stability.

#### QueryString Addon

```js
// ❌ Before (v2)
wretch("https://api.example.com")
  .addon(QueryStringAddon)
  .query({ a: 1 }, true) // replace parameter
  .query({ b: undefined, c: 2 }, false, true) // omitUndefinedOrNullValues parameter

// ✅ After (v3)
wretch("https://api.example.com")
  .addon(QueryStringAddon)
  .query({ a: 1 }, { replace: true })
  .query({ b: undefined, c: 2 }, { omitUndefinedOrNullValues: true })
```

#### FormData Addon

```js
// ❌ Before (v2)
wretch("https://api.example.com")
  .addon(FormDataAddon)
  .formData(formObject, true) // recursive parameter
  .formData(formObject, ["excludedKey"]) // exclude specific keys

// ✅ After (v3)
wretch("https://api.example.com")
  .addon(FormDataAddon)
  .formData(formObject, { recursive: true })
  .formData(formObject, { recursive: ["excludedKey"] })
```

#### Abort Addon

```js
// ❌ Before (v2)
const controller = new AbortController()
wretch("https://api.example.com")
  .addon(AbortAddon())
  .get()
  .setTimeout(1000, controller) // controller as second parameter

// ✅ After (v3)
const controller = new AbortController()
wretch("https://api.example.com")
  .addon(AbortAddon())
  .get()
  .setTimeout(1000, { controller })
```

**Why this change?**

Using options objects prevents the need for breaking changes when adding new optional parameters in the future, improving long-term API stability and developer experience.

## Need Help?

If you encounter issues during migration:
1. Check the [API documentation](https://elbywan.github.io/wretch/api)
2. Review the [examples in the README](https://github.com/elbywan/wretch#readme)
3. Open an issue on [GitHub](https://github.com/elbywan/wretch/issues)

## Staying on v2

If you need to support Node.js versions older than 22, continue using Wretch v2:

```bash
npm install wretch@^2
```
