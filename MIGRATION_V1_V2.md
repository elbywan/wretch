# Migration Guide: Wretch v1 to v2

This guide outlines the breaking changes and migration steps required when upgrading from Wretch v1 to v2.

## Philosophy

Wretch v2 was **completely rewritten** with the following goals in mind:

- Reduce bundle size by making it modular
- Preserve TypeScript type coverage
- Improve the API by removing several awkward choices

## Compatibility

- `wretch@1` was transpiled to **es5**
- `wretch@2` is transpiled to **es2018**

Any "modern" browser and Node.js versions >= 14 should parse the library without issues.

If you need compatibility with older browsers/Node.js versions, then either:
- Stick with v1
- Use polyfills
- Configure `@babel` to transpile wretch

## Breaking Changes

### 1. Addons System

Some features that were part of `wretch` v1 core are now split into separate addons that must be imported and registered.

#### Before (v1)
```js
import wretch from "wretch"

wretch()
  .formData({ hello: "world" })
  .query({ check: true })
```

#### After (v2)
```js
import FormDataAddon from "wretch/addons/formData"
import QueryStringAddon from "wretch/addons/queryString"
import wretch from "wretch"

// Register addons
const w = wretch().addon(FormDataAddon).addon(QueryStringAddon)

// Now the features are available
w.formData({ hello: "world" }).query({ check: true })
```

#### Affected Features (Now Addons)

The following features are now separate addons:

- **QueryString** - `wretch/addons/queryString`
- **FormData** - `wretch/addons/formData`
- **FormUrl** - `wretch/addons/formUrl`
- **BasicAuth** - `wretch/addons/basicAuth`
- **Abort** - `wretch/addons/abort`
- **Progress** - `wretch/addons/progress`
- **Performance** - `wretch/addons/perfs`

Please refer to the [Addons documentation](https://github.com/elbywan/wretch#addons) for details.

### 2. TypeScript Types

Types have been renamed and refactored. Update your imports accordingly.

Refer to the [TypeScript API documentation](https://elbywan.github.io/wretch/api) for the new type names.

### 3. Replace/Mixin Arguments

#### Before (v1)

Some functions used inconsistent `mixin` or `replace` arguments:

```js
// false: do not merge the value
wretch.options({ credentials: "same-origin" }, false)
```

#### After (v2)

All functions now consistently use `replace = false` arguments:

```js
// Use per-instance configuration instead of global
const api = wretch("https://api.example.com", { credentials: "same-origin" })
```

The default behavior (merging) is preserved.

### 4. HTTP Methods Extra Argument

#### Before (v1)

In v1, you could pass fetch options as an argument to HTTP methods:

```js
wretch("...").get({ my: "option" })
```

#### After (v2)

The extra argument now **appends a URL segment** instead:

```js
wretch("https://base.com").get("/resource/1")

// To set options, use .options() before calling the HTTP method
wretch("...")
  .options({ my: "option" })
  .get()
```

This change makes the API more consistent and intuitive.

### 5. Replay Function Renamed

#### Before (v1)
```js
wretch("...").replay()
```

#### After (v2)
```js
wretch("...").fetch()
```

The `.replay()` function has been renamed to [`.fetch()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#fetch).

## Migration Checklist

- [ ] Update minimum Node.js version to 14+
- [ ] Import and register required addons (QueryString, FormData, etc.)
- [ ] Update TypeScript type imports
- [ ] Replace `.replay()` calls with `.fetch()`
- [ ] Update HTTP method calls if passing options as arguments
- [ ] Review `replace`/`mixin` argument usage
- [ ] Test your application thoroughly

## Benefits of v2

- **Smaller core bundle** - Only include addons you need
- **Better modularity** - Tree-shakeable imports
- **Improved API consistency** - More intuitive method signatures
- **Maintained type safety** - Full TypeScript coverage
- **Modern JavaScript** - Cleaner, more performant code

## Need Help?

If you encounter issues during migration:
1. Check the [API documentation](https://elbywan.github.io/wretch/api)
2. Review the [examples in the README](https://github.com/elbywan/wretch#readme)
3. Open an issue on [GitHub](https://github.com/elbywan/wretch/issues)

## Staying on v1

If you need to support older environments (ES5, Node.js <14), continue using Wretch v1:

```bash
npm install wretch@^1
```
