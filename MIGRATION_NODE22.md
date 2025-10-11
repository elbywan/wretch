# Migration Guide: Dropping Node.js <22 Support

This document summarizes the changes made to remove polyfill support and require Node.js 22+.

## Summary

Wretch now requires Node.js 22+ which includes native support for all required Web APIs:
- `fetch`
- `FormData`
- `URLSearchParams`
- `AbortController`
- `URL`
- `performance` and `PerformanceObserver`

## Breaking Changes

### Removed APIs

1. **`.polyfills()` method removed** - Use `.fetchPolyfill()` instead
   ```js
   // OLD (removed)
   wretch().polyfills({ fetch: customFetch, FormData })
   
   // NEW
   wretch().fetchPolyfill(customFetch)
   ```

2. **`wretch.polyfills()` static method removed** - Global configuration has been removed to reduce bundle size. Use per-instance configuration instead.
   ```js
   // OLD (removed)
   wretch.polyfills({ fetch: customFetch })
   
   // NEW - Use per-instance configuration
   const api = wretch("https://api.example.com")
     .fetchPolyfill(customFetch)
   ```

3. **Internal polyfill system removed** - All Web APIs are now used directly from Node.js

### Updated APIs

**New `.fetchPolyfill()` method** - Allows custom fetch implementation per-instance

```js
// Set custom fetch per-instance
const api = wretch("https://api.example.com")
  .fetchPolyfill((url, opts) => {
    console.log('Fetching:', url)
    return fetch(url, opts)
  })
```

## Migration Steps

### 1. Update Node.js version
Ensure you're using Node.js 22 or later:
```bash
node --version  # Should be v22.0.0 or higher
```

### 2. Remove polyfill dependencies
Remove packages like:
- `node-fetch`
- `abortcontroller-polyfill`
- `whatwg-url`
- `form-data` (unless you specifically need stream support)

```bash
npm uninstall node-fetch abortcontroller-polyfill whatwg-url
```

### 3. Update code using `.polyfills()`

If you only used `.polyfills()` for custom fetch:
```js
// Before
wretch().polyfills({ fetch: myCustomFetch })

// After
wretch().fetchPolyfill(myCustomFetch)
```

If you used multiple polyfills, only fetch can be customized now:
```js
// Before
wretch().polyfills({
  fetch: customFetch,
  FormData: FormDataPolyfill,  // No longer needed
  URLSearchParams: URLSearchParamsPolyfill  // No longer needed
})

// After
wretch().fetchPolyfill(customFetch)
// FormData, URLSearchParams, etc. are now native
```

### 4. Update addon usage

All addons now use native APIs automatically. No changes needed in your code.

## Benefits

- **Smaller bundle size** - No polyfill code
- **Better performance** - Native implementations are optimized
- **Simpler code** - Less abstraction layers
- **Up-to-date APIs** - Always using the latest Node.js implementations

## Questions?

If you need to support older Node.js versions, please continue using wretch v2.10.0 or earlier.
