<h1 align="center">
	<a href="https://elbywan.github.io/wretch"><img src="assets/wretch.svg" alt="wretch-logo" width="220px"></a><br>
	<br>
    <a href="https://elbywan.github.io/wretch">Wretch</a><br>
	<br>
  <a href="https://github.com/elbywan/wretch/actions/workflows/node.yml"><img alt="github-badge" src="https://github.com/elbywan/wretch/actions/workflows/node.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/wretch"><img alt="npm-badge" src="https://img.shields.io/npm/v/wretch.svg?colorB=ff733e" height="20"></a>
  <a href="https://www.npmjs.com/package/wretch"><img alt="npm-downloads-badge" src="https://img.shields.io/npm/dm/wretch.svg?colorB=53aabb" height="20"></a>
  <a href="https://coveralls.io/github/elbywan/wretch?branch=master"><img src="https://coveralls.io/repos/github/elbywan/wretch/badge.svg?branch=master" alt="Coverage Status"></a>
  <a href="https://bundlejs.com/?q=wretch#sharing"><img src='https://deno.bundlejs.com/badge?q=wretch'/></a>
  <a href="https://github.com/elbywan/wretch/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license-badge" height="20"></a>
</h1>
<h4 align="center">
	A tiny (~1.8KB g-zipped) wrapper built around <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch">fetch</a> with an intuitive syntax.
</h4>
<h5 align="center">
    <i>f[ETCH] [WR]apper</i>
</h6>

<br>

##### Wretch 3.0 is now live 🎉 ! Check out the [Migration Guide](MIGRATION_V2_V3.md) for upgrading from v2, and please have a look at the [releases](https://github.com/elbywan/wretch/releases) and the [changelog](https://github.com/elbywan/wretch/blob/master/CHANGELOG.md) after each update for new features and breaking changes.

##### And if you like the library please consider becoming a [sponsor](https://github.com/sponsors/elbywan) ❤️.

# Features

#### `wretch` is a small wrapper around [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) designed to simplify the way to perform network requests and handle responses.

- 🪶 **Small** - core is less than 1.8KB g-zipped
- 💡 **Intuitive** - lean API, handles errors, headers and (de)serialization
- 🧊 **Immutable** - every call creates a cloned instance that can then be reused safely
- 🔌 **Modular** - plug addons to add new features, and middlewares to intercept requests
- 🧩 **Isomorphic** - compatible with modern browsers, Node.js 22+, Deno and Bun
- 🦺 **Type safe** - strongly typed, written in TypeScript
- ✅ **Proven** - fully covered by unit tests and widely used
- 💓 **Maintained** - alive and well for many years

# Table of Contents

- [**Quick Start**](#quick-start)
- [**Motivation**](#motivation)
- [**Installation**](#installation)
- [**Compatibility**](#compatibility)
- [**Usage**](#usage)
- [**Recipes**](#recipes)
- [**Api**](#api-)
- [**Addons**](#addons)
- [**Middlewares**](#middlewares)
- [**Migration Guides**](#migration-guides)
- [**License**](#license)

# Quick Start

```bash
# 1️⃣ Install
npm i wretch
```

```javascript
// 2️⃣ Import and create a reusable API client
import wretch from "wretch"

const api = wretch("https://jsonplaceholder.typicode.com")
  .options({ mode: "cors" })

// 3️⃣ Make requests with automatic JSON handling
const post = await api.get("/posts/1").json()
console.log(post.title)

// 4️⃣ POST with automatic serialization
const created = await api
  .post({ title: "New Post", body: "Content", userId: 1 }, "/posts")
  .json()

// 5️⃣ Handle errors elegantly
await api
  .get("/posts/999")
  .notFound(() => console.log("Post not found!"))
  .json()

// 6️⃣ Different response types
const text = await api.get("/posts/1").text()      // Raw text
const response = await api.get("/posts/1").res()   // Raw Response object
const blob = await api.get("/photos/1").blob()     // Binary data
```

# Motivation

#### Because having to write a second callback to process a response body feels awkward.

Fetch needs a second callback to process the response body.

```javascript
fetch("https://jsonplaceholder.typicode.com/posts/1")
  .then(response => response.json())
  .then(json => {
    //Do stuff with the parsed json
  });
```

Wretch does it for you.

```javascript
// Use .res for the raw response, .text for raw text, .json for json, .blob for a blob …
wretch("https://jsonplaceholder.typicode.com/posts/1")
  .get()
  .json(json => {
    // Do stuff with the parsed json
  });
```

#### Because manually checking and throwing every request error code is tedious.

Fetch won’t reject on HTTP error status.

```javascript
fetch("https://jsonplaceholder.typicode.com/posts/1")
  .then(response => {
    if(!response.ok) {
      if(response.status === 404) throw new Error("Not found")
      else if(response.status === 401) throw new Error("Unauthorized")
      else if(response.status === 418) throw new Error("I'm a teapot !")
      else throw new Error("Other error")
    }
    else {/* … */}
  })
  .then(data => {/* … */})
  .catch(error => { /* … */ })
```

Wretch throws when the response is not successful and contains helper methods to handle common codes.

```javascript
wretch("https://jsonplaceholder.typicode.com/posts/1")
  .get()
  .notFound(error => { /* … */ })
  .unauthorized(error => { /* … */ })
  .error(418, error => { /* … */ })
  .res(response => {/* … */ })
  .catch(error => { /* uncaught errors */ })
```

#### Because sending a json object should be easy.

With fetch you have to set the header, the method and the body manually.

```javascript
fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ "hello": "world" })
}).then(response => {/* … */})
// Omitting the data retrieval and error management parts…
```

With wretch, you have shorthands at your disposal.

```javascript
wretch("https://jsonplaceholder.typicode.com/posts")
  .post({ "hello": "world" })
  .res(response => { /* … */ })
```

#### Because configuration should not rhyme with repetition.

A Wretch object is immutable which means that you can reuse previous instances safely.

```javascript
const token = "MY_SECRET_TOKEN"

// Cross origin authenticated requests on an external API
const externalApi = wretch("https://jsonplaceholder.typicode.com") // Base url
  // Authorization header
  .auth(`Bearer ${token}`)
  // Cors fetch options
  .options({ credentials: "include", mode: "cors" })
  // Handle 403 errors
  .resolve((w) => w.forbidden(error => { /* Handle all 403 errors */ }));

// Fetch a resource
const resource = await externalApi
  // Add a custom header for this request
  .headers({ "If-Unmodified-Since": "Wed, 21 Oct 2015 07:28:00 GMT" })
  .get("/posts/1")
  .json(() => {/* do something with the resource */});

// Post a resource
externalApi
  .url("/posts")
  .post({ "Shiny new": "resource object" })
  .json(() => {/* do something with the created resource */});
```

# Installation

## Package Manager

```sh
npm i wretch # or yarn/pnpm add wretch
```

## &lt;script&gt; tag

The package contains multiple bundles depending on the format and feature set located under the `/dist/bundle` folder.

<details>

<summary>Bundle variants</summary>
<br>

> 💡 If you pick the core bundle, then to plug addons you must import them separately from `/dist/bundle/addons/[addonName].min.js`

| Feature set        | File Name           |
| ------------------ | ------------------- |
| Core features only | `wretch.min.js`     |
| Core + all addons  | `wretch.all.min.js` |

| Format   | Extension  |
| -------- | ---------- |
| ESM      | `.min.mjs` |
| CommonJS | `.min.cjs` |
| UMD      | `.min.js`  |

</details>

```html
<!--
  Pick your favourite CDN:
    - https://unpkg.com/wretch
    - https://cdn.jsdelivr.net/npm/wretch/
    - https://www.skypack.dev/view/wretch
    - https://cdnjs.com/libraries/wretch
    - …
-->

<!-- UMD import as window.wretch -->
<script src="https://unpkg.com/wretch"></script>

<!-- Modern import -->
<script type="module">
  import wretch from 'https://cdn.skypack.dev/wretch/dist/bundle/wretch.all.min.mjs'

  // … //
</script>
```

# Compatibility

## Browsers

`wretch@^3` is compatible with modern browsers only. For older browsers please use `wretch@^1`.

## Node.js

Wretch is compatible with and tested in _Node.js >= 22_.

For older Node.js versions, please use `wretch@^2`.

Node.js 22+ includes native fetch support and all required Web APIs (FormData, URLSearchParams, AbortController, etc.) out of the box, so no polyfills are needed.

## Deno

Works with [Deno](https://deno.land/) out of the box.

```bash
deno add npm:wretch
```

```ts
import wretch from "wretch";

const text = await wretch("https://httpbun.org").get("/status/200").text();
console.log(text); // -> { "code": 200, "description": "OK" }
```

## Bun

Works with [Bun](https://bun.sh/) out of the box.

```bash
bun add wretch
```

```ts
import wretch from "wretch";

const text = await wretch("https://httpbun.org").get("/status/200").text();
console.log(text); // -> { "code": 200, "description": "OK" }
```

# Usage

## Import

<!-- snippet:skip Browser specific code -->
```typescript
// ECMAScript modules
import wretch from "wretch"
// CommonJS
const wretch = require("wretch")
// Global variable (script tag)
window.wretch
```

## Common Use Cases

```javascript
// 🌐 REST API Client
const api = wretch("https://jsonplaceholder.typicode.com")
  .auth("Bearer token")
  .resolve(r => r.json())

const users = await api.get("/users")
const user = await api.post({ name: "John" }, "/users")
```

```javascript
// 📤 File Upload with Progress
import ProgressAddon from "wretch/addons/progress"
import FormDataAddon from "wretch/addons/formData"

await wretch("https://httpbun.org/post")
  .addon([FormDataAddon, ProgressAddon()])
  .formData({ file: file })
  .post()
  .progress((loaded, total) => console.log(`${(loaded/total*100).toFixed()}%`))
  .json()
```

```javascript
// 🔄 Auto-retry on Network Failure
import { retry } from "wretch/middlewares"

const resilientApi = wretch()
  .middlewares([retry({ maxAttempts: 3, retryOnNetworkError: true })])
```

```typescript
// 🎯 Type-safe TypeScript
interface User { id: number; name: string; email: string }

const user = await wretch("https://jsonplaceholder.typicode.com")
  .get("/users/1")
  .json<User>() // Fully typed!
```

```javascript
// 🔐 Automatic Token Refresh
const api = wretch("https://httpbun.org/bearer/token")
  .resolve(w => w.unauthorized(async (error, req) => {
    const newToken = await refreshToken()
    return req
    .auth(`Bearer ${newToken}`)
    .unauthorized(e => {
      console.log("Still unauthorized after token refresh");
      throw e
    })
    .fetch()
    .json()
  }))
```

## Custom Fetch Implementation

You can provide a custom fetch implementation using the `.fetchPolyfill()` method. This is useful for:

- Adding custom middleware or instrumentation to all requests
- Using alternative fetch implementations
- Mocking fetch in tests
- Adding performance monitoring

```js
import wretch from "wretch"

// Per-instance custom fetch
const api = wretch("https://jsonplaceholder.typicode.com")
  .fetchPolyfill((url, opts) => {
    console.log('Fetching:', url)
    console.time(url)
    return fetch(url, opts).finally(() => {
      console.timeEnd(url)
    })
  })

await api.get("/posts").json()
```

## Chaining

**A high level overview of the successive steps that can be chained to perform a request and parse the result.**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Request Chain                            │
│                                                                 │
│  wretch(url) ──> .helper() ──> .body() ──> .httpMethod()        │
│                    ↓              ↓            ↓                │
│                 .headers()     .json()      .get()              │
│                 .auth()        .body()      .post()             │
│                 .options()                  .put()              │
│                                             .delete()           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [ fetch() is called ]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Response Chain                            │
│                                                                 │
│  .catcher() ──> .responseType() ──> Promise ──> .then()/.catch()│
│      ↓              ↓                                           │
│  .notFound()     .json()                                        │
│  .unauthorized() .text()                                        │
│  .error()        .blob()                                        │
│                  .res()                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Step-by-step breakdown:**

<!-- snippet:skip -->
```ts
// First, instantiate wretch
wretch(baseUrl, baseOptions)
```

_The "request" chain starts here._

<!-- snippet:skip -->
```ts
  // Optional - A set of helper methods to set the default options, set accept header, change the current url…
  .<helper method(s)>()
  // Optional - Serialize an object to json or FormData formats and sets the body & header field if needed
  .<body type>()
    // Required - Sends the get/put/post/delete/patch request.
  .<http method>()
```

_The "response" chain starts here._

_Fetch is called after the request chain ends and before the response chain starts._<br>
_The request is on the fly and now it is time to chain catchers and finally call a response type handler._

<!-- snippet:skip -->
```ts
  // Optional - You can chain error handlers here
  .<catcher(s)>()
  // Required - Specify the data type you need, which will be parsed and handed to you
  .<response type>()
  // >> Ends the response chain.
```

_From this point on, wretch returns a standard Promise._

<!-- snippet:skip -->
```ts
  .then(…)
  .catch(…)
```

### Concrete Example

Here's how the chaining works in practice:

<!-- snippet:skip Example -->
```js
await wretch("https://api.example.com")        // Base URL
  .headers({ "X-Api-Key": "secret" })          // Helper method
  .query({ limit: 10 })                        // Helper method
  .json({ name: "Alice", role: "admin" })      // Body type
  .post("/users")                              // HTTP method (starts request)
  .badRequest(err => console.log("Invalid"))   // Catcher
  .unauthorized(err => console.log("No auth")) // Catcher
  .json(user => console.log(user))             // Response type
```

# Recipes

Looking for common patterns and solutions? Check out the **[Recipes Guide](RECIPES.md)** for practical examples covering:

- **Error Handling** - Parsing error response bodies, custom error types, global handlers
- **TypeScript Patterns** - Typing precomposed instances, reusable catchers
- **File Uploads** - Progress tracking, FormData handling
- **Query Strings** - Filtering undefined values
- **Request Control** - Combining timeouts with AbortControllers, aborting on errors
- **Advanced Patterns** - Token refresh & replay, schema validation, async polling

# [API 🔗](https://elbywan.github.io/wretch/api)

> 💡 The API documentation is now autogenerated and hosted separately, click the links access it.

### [Factory Method 🔗](https://elbywan.github.io/wretch/api/functions/index.default)

The default export is a factory function used to instantiate wretch.

```js
import wretch from "wretch"

const api = wretch("http://domain.com/", { cache: "default" })
```

### [Helper Methods 🔗](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#accept)

Helper Methods are used to configure the request and program actions.

**Available methods:** [`.url()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#url) · [`.options()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#options) · [`.headers()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#headers) · [`.auth()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#auth) · [`.accept()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#accept) · [`.content()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#content) · [`.signal()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#signal) · [`.fetchPolyfill()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#fetchPolyfill) · [`.catcher()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#catcher) · [`.catcherFallback()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#catcherFallback) · [`.customError()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#customError) · [`.defer()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#defer) · [`.resolve()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#resolve) · [`.middlewares()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#middlewares) · [`.addon()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#addon) · [`.polyfills()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#polyfills)

```js
let api = wretch("http://domain.com/")

api = api
  .url("/posts/1")
  .headers({ "Cache-Control": "no-cache" })
  .content("text/html")
```

### [Body Types 🔗](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#body)

Specify a body type if uploading data. Can also be added through the HTTP Method argument.

**Available methods:** [`.body()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#body) · [`.json()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#json)

```js
let api = wretch("http://domain.com/")

api = api.body("<html><body><div/></body></html>")
```

### [HTTP Methods 🔗](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#delete)

Sets the HTTP method and sends the request.

Calling an HTTP method ends the request chain and returns a response chain.
You can pass optional url and body arguments to these methods.

**Available methods:** [`.get()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#get) · [`.post()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#post) · [`.put()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#put) · [`.patch()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#patch) · [`.delete()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#delete) · [`.head()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#head) · [`.opts()`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#opts)

```js
const api = wretch("http://jsonplaceholder.typicode.com")

// These shorthands:
api.get("/posts");
api.post({ json: "body" }, "/posts");
// Are equivalent to:
api.url("/posts").get();
api.json({ json: "body" }).url("/posts").post();
```

**NOTE:** if the body argument is an `Object` it is assumed that it is a JSON payload and it will have the same behaviour as calling `.json(body)` unless the `Content-Type` header has been set to something else beforehand.


### [Catchers 🔗](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#badRequest)

Catchers are optional, but if none are provided an error will still be thrown for http error codes and it will be up to you to catch it.

**Available methods:** [`.badRequest()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#badRequest) · [`.unauthorized()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#unauthorized) · [`.forbidden()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#forbidden) · [`.notFound()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#notFound) · [`.timeout()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#timeout) · [`.internalError()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#internalError) · [`.error()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#error) · [`.fetchError()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#fetchError)

```js
wretch("http://domain.com/resource")
  .get()
  .badRequest((err) => console.log(err.status))
  .unauthorized((err) => console.log(err.status))
  .forbidden((err) => console.log(err.status))
  .notFound((err) => console.log(err.status))
  .timeout((err) => console.log(err.status))
  .internalError((err) => console.log(err.status))
  .error(418, (err) => console.log(err.status))
  .fetchError((err) => console.log(err))
  .res();
```

The error passed to catchers is enhanced with additional properties.

<!-- snippet:skip -->
```ts
type WretchError = Error & {
  status: number;
  response: WretchResponse;
  url: string;
};
```

By default, `error.message` is set to the response body text (or `statusText` if body parsing fails).

#### Request Replay

The original request is passed along the error and can be used in order to
perform an additional request.

```js
await wretch("https://httpbun.org/bearer/aeacf2af-88e6-4f81-a0b0-77a121504ca8")
  .get()
  .unauthorized(async (error, req) => {
    // Renew credentials
    const token = await wretch("https://httpbun.org/mix/s=200/b64=YWVhY2YyYWYtODhlNi00ZjgxLWEwYjAtNzdhMTIxNTA0Y2E4").get().text();
    // Replay the original request with new credentials
    return req
      .auth("Bearer " + token)
      .fetch()
      .unauthorized((err) => { throw err })
      .json();
  })
  .json()
  // The promise chain is preserved as expected
  // ".then" will be performed on the result of the original request
  // or the replayed one (if a 401 error was thrown)
  .then(() => { /* … */ });
```

### [Response Types 🔗](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#arrayBuffer)

Setting the final response body type ends the chain and returns a regular promise.

All these methods accept an optional callback, and will return a Promise
resolved with either the return value of the provided callback or the expected
type.

**Available methods:** [`.res()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#res) · [`.json()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#json) · [`.text()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#text) · [`.blob()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#blob) · [`.arrayBuffer()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#arrayBuffer) · [`.formData()`](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#formData)

```js
const ENDPOINT = "https://jsonplaceholder.typicode.com/posts/1"

// Without a callback
wretch(ENDPOINT)
  .get()
  .json()
  .then(json => {
    /* the json argument is the parsed json of the response body */
  })
// Without a callback using await
const json = await wretch(ENDPOINT).get().json()
// With a callback the value returned is passed to the Promise
wretch(ENDPOINT).get().json(json => "Hello world!").then(console.log) // => Hello world!
```

_If an error is caught by catchers, the response type handler will not be
called._

# Addons

Addons are separate pieces of code that you can import and plug into `wretch` to add new features.

```js
import FormDataAddon from "wretch/addons/formData"
import QueryStringAddon from "wretch/addons/queryString"

// Add both addons
const w = wretch().addon([FormDataAddon, QueryStringAddon])

// Additional features are now available
w.formData({ hello: "world" }).query({ check: true })
```

Typescript should also be fully supported and will provide completions.

https://user-images.githubusercontent.com/3428394/182319457-504a0856-abdd-4c1d-bd04-df5a061e515d.mov

### [QueryString 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_queryString.QueryStringAddon)

Used to construct and append the query string part of the URL from an object.

```js
import QueryStringAddon from "wretch/addons/queryString"

let w = wretch("http://example.com").addon(QueryStringAddon);
// url is http://example.com
w = w.query({ a: 1, b: 2 });
// url is now http://example.com?a=1&b=2
w = w.query({ c: 3, d: [4, 5] });
// url is now http://example.com?a=1&b=2c=3&d=4&d=5
w = w.query("five&six&seven=eight");
// url is now http://example.com?a=1&b=2c=3&d=4&d=5&five&six&seven=eight
w = w.query({ reset: true }, { replace: true });
// url is now  http://example.com?reset=true
```

### [FormData 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_formData.FormDataAddon)

Adds a helper method to serialize a `multipart/form-data` body from an object.

```js
import FormDataAddon from "wretch/addons/formData"

const form = {
  duck: "Muscovy",
  duckProperties: {
    beak: {
      color: "yellow",
    },
    legs: 2,
  },
  ignored: {
    key: 0,
  },
};

// Will append the following keys to the FormData payload:
// "duck", "duckProperties[beak][color]", "duckProperties[legs]"
wretch("https://httpbun.org/post").addon(FormDataAddon).formData(form, { recursive: ["ignored"] }).post();
```

### [FormUrl 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_formUrl.FormUrlAddon)

Adds a method to serialize a `application/x-www-form-urlencoded` body from an object.

```js
import FormUrlAddon from "wretch/addons/formUrl"

const form = { a: 1, b: { c: 2 } };
const alreadyEncodedForm = "a=1&b=%7B%22c%22%3A2%7D";

// Automatically sets the content-type header to "application/x-www-form-urlencoded"
wretch("https://httpbun.org/post").addon(FormUrlAddon).formUrl(form).post();
wretch("https://httpbun.org/post").addon(FormUrlAddon).formUrl(alreadyEncodedForm).post();
```

### [Abort 🔗](https://elbywan.github.io/wretch/api/functions/addons_abort.default)

Adds the ability to abort requests and set timeouts using AbortController and signals under the hood.

```js
import AbortAddon from "wretch/addons/abort"
```

Use cases :

```js
const [c, w] = wretch("https://httpbun.org/get")
  .addon(AbortAddon())
  .get()
  .onAbort((_) => console.log("Aborted !"))
  .controller();

w.text((_) => console.log("should never be called"));
c.abort();

// Or :

const controller = new AbortController();

wretch("https://httpbun.org/get")
  .addon(AbortAddon())
  .signal(controller)
  .get()
  .onAbort((_) => console.log("Aborted !"))
  .text((_) => console.log("should never be called"));

controller.abort();
```

```js
wretch("https://httpbun.org/delay/2")
  .addon(AbortAddon())
  .get()
   // 1 second timeout
  .setTimeout(1000)
  .onAbort(_ => {
    console.log("Request timed out")
  })
  .json(_ => {
    console.log("Response received in time")
  })
```

### [BasicAuth 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_basicAuth.BasicAuthAddon)

Adds the ability to set the `Authorization` header for the [basic authentication scheme](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme) without the need to manually encode the username/password.

Also, allows using URLs with `wretch` that contain credentials, which would otherwise throw an error.

```js
import BasicAuthAddon from "wretch/addons/basicAuth"

const user = "user"
const pass = "pass"

// Automatically sets the Authorization header to "Basic " + <base64 encoded credentials>
wretch("https://httpbun.org/get")
  .addon(BasicAuthAddon)
  .basicAuth(user, pass)
  .get()

// Allows using URLs with credentials in them
wretch(`https://${user}:${pass}@httpbun.org/basic-auth/${user}/${pass}`)
  .addon(BasicAuthAddon)
  .get()
```

### [Progress 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_progress.ProgressResolver)

Adds the ability to monitor progress when downloading or uploading.

_Compatible with all platforms implementing the [TransformStream WebAPI](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream#browser_compatibility)._

**Download progress:**

```js
import ProgressAddon from "wretch/addons/progress"

await wretch("https://httpbun.org/bytes/5000000")
  .addon(ProgressAddon())
  .get()
  // Called with the number of bytes loaded and the total number of bytes to load
  .progress((loaded, total) => {
    console.log(`Download: ${(loaded / total * 100).toFixed(0)}%`)
  })
  .blob()
```

**Upload progress:**

```js
import ProgressAddon from "wretch/addons/progress"
import FormDataAddon from "wretch/addons/formData"

const formData = new FormData()
formData.append('file', file)

wretch("https://httpbun.org/post")
  .addon([ProgressAddon(), FormDataAddon])
  .onUpload((loaded, total) => {
    console.log(`Upload: ${(loaded / total * 100).toFixed(0)}%`)
  })
  .post(formData)
  .res()
```

> **Note for browsers:** Upload progress requires HTTPS (HTTP/2) in Chrome/Chromium and doesn't work in Firefox due to streaming limitations. Works fully in Node.js.

### [Performance 🔗](https://elbywan.github.io/wretch/api/functions/addons_perfs.default)

Adds the ability to measure requests using the Performance Timings API.

Uses the Performance API (browsers & Node.js) to expose timings related to the underlying request.

> 💡 Make sure to follow the additional instructions in the documentation to setup Node.js if necessary.

# Middlewares

Middlewares are functions that can intercept requests before being processed by
Fetch. Wretch includes a helper to help replicate the
[middleware](http://expressjs.com/en/guide/using-middleware.html) style.

```js
import wretch from "wretch"
import { retry, dedupe } from "wretch/middlewares"

const w = wretch().middlewares([retry(), dedupe()])
```

> 💡 The following middlewares were previously provided by the [`wretch-middlewares`](https://github.com/elbywan/wretch-middlewares/) package.

### [Retry 🔗](https://elbywan.github.io/wretch/api/types/middlewares_retry.RetryMiddleware)

**Retries a request multiple times in case of an error (or until a custom condition is true).**

> **💡 By default, the request will be retried only for server errors (5xx) and other non-successful responses, but not for client errors (4xx).**
>
> ```js
> // To retry on all non-2xx responses (including 4xx):
> until: (response, error) => !!response && response.ok
> ```

```js
import wretch from 'wretch'
import { retry } from 'wretch/middlewares'

wretch().middlewares([
  retry({
    /* Options - defaults below */
    delayTimer: 500,
    delayRamp: (delay, nbOfAttempts) => delay * nbOfAttempts,
    maxAttempts: 10,
    until: (response, error) => !!response && (response.ok || (response.status >= 400 && response.status < 500)),
    onRetry: undefined,
    retryOnNetworkError: false,
    resolveWithLatestResponse: false
  })
])

// You can also return a Promise, which is useful if you want to inspect the body:
wretch().middlewares([
  retry({
    until: response =>
      response?.clone().json().then(body =>
        body.field === 'something'
      ) || false
  })
])
```

### [Dedupe 🔗](https://elbywan.github.io/wretch/api/types/middlewares_dedupe.DedupeMiddleware)

**Prevents having multiple identical requests on the fly at the same time.**

```js
import wretch from 'wretch'
import { dedupe } from 'wretch/middlewares'

wretch().middlewares([
  dedupe({
    /* Options - defaults below */
    skip: (url, opts) => opts.skipDedupe || opts.method !== 'GET',
    key: (url, opts) => opts.method + '@' + url,
    resolver: response => response.clone()
  })
])
```

### [Throttling Cache 🔗](https://elbywan.github.io/wretch/api/types/middlewares_throttlingCache.ThrottlingCacheMiddleware)

**A throttling cache which stores and serves server responses for a certain amount of time.**

```js
import wretch from 'wretch'
import { throttlingCache } from 'wretch/middlewares'

wretch().middlewares([
  throttlingCache({
    /* Options - defaults below */
    throttle: 1000,
    skip: (url, opts) => opts.skipCache || opts.method !== 'GET',
    key: (url, opts) => opts.method + '@' + url,
    clear: (url, opts) => false,
    invalidate: (url, opts) => null,
    condition: response => response.ok,
    flagResponseOnCacheHit: '__cached'
  })
])
```

### [Delay 🔗](https://elbywan.github.io/wretch/api/types/middlewares_delay.DelayMiddleware)

**Delays the request by a specific amount of time.**

```js
import wretch from 'wretch'
import { delay } from 'wretch/middlewares'

wretch().middlewares([
  delay(1000)
])
```

## Writing a Middleware

Basically a Middleware is a function having the following signature :

<!-- snippet:skip-->
```ts
// A middleware accepts options and returns a configured version
type Middleware = (options?: { [key: string]: any }) => ConfiguredMiddleware;
// A configured middleware (with options curried)
type ConfiguredMiddleware = (next: FetchLike) => FetchLike;
// A "fetch like" function, accepting an url and fetch options and returning a response promise
type FetchLike = (
  url: string,
  opts: WretchOptions,
) => Promise<WretchResponse>;
```

### Context

If you need to manipulate data within your middleware and expose it for later
consumption, a solution could be to pass a named property to the wretch options
(_suggested name: `context`_).

Your middleware can then take advantage of that by mutating the object
reference.

```js
const contextMiddleware = (next) =>
  (url, opts) => {
    if (opts.context) {
      // Mutate "context"
      opts.context.property = "anything";
    }
    return next(url, opts);
  };

// Provide the reference to a "context" object
const context = {};
const res = await wretch("https://httpbun.org/get")
  // Pass "context" by reference as an option
  .options({ context })
  .middlewares([contextMiddleware])
  .get()
  .res();

console.log(context.property); // prints "anything"
```

### Advanced examples

<details>
  <summary>&nbsp;<strong>👀 Show me the code</strong></summary>
  <br>

```javascript
/* A simple delay middleware. */
const delayMiddleware = delay => next => (url, opts) => {
  return new Promise(res => setTimeout(() => res(next(url, opts)), delay))
}

/* Returns the url and method without performing an actual request. */
const shortCircuitMiddleware = () => next => (url, opts) => {
  // We create a new Response object to comply because wretch expects that from fetch.
  const response = new Response(url)
  // Instead of calling next(), returning a Response Promise bypasses the rest of the chain.
  return Promise.resolve(response)
}

/* Logs all requests passing through. */
const logMiddleware = () => next => (url, opts) => {
  console.log(opts.method + "@" + url)
  return next(url, opts)
}

/* A throttling cache. */
const cacheMiddleware = (throttle = 0) => {

  const cache = new Map()
  const inflight = new Map()
  const throttling = new Set()

  return next => (url, opts) => {
    const key = opts.method + "@" + url

    if(!opts.noCache && throttling.has(key)) {
      // If the cache contains a previous response and we are throttling, serve it and bypass the chain.
      if(cache.has(key))
        return Promise.resolve(cache.get(key).clone())
      // If the request in already in-flight, wait until it is resolved
      else if(inflight.has(key)) {
        return new Promise((resolve, reject) => {
          inflight.get(key).push([resolve, reject])
        })
      }
    }

    // Init. the pending promises Map
    if(!inflight.has(key))
      inflight.set(key, [])

    // If we are not throttling, activate the throttle for X milliseconds
    if(throttle && !throttling.has(key)) {
      throttling.add(key)
      setTimeout(() => { throttling.delete(key) }, throttle)
    }

    // We call the next middleware in the chain.
    return next(url, opts)
      .then(_ => {
        // Add a cloned response to the cache
        cache.set(key, _.clone())
        // Resolve pending promises
        inflight.get(key)?.forEach((([resolve, reject]) => resolve(_.clone())))
        // Remove the inflight pending promises
        inflight.delete(key)
        // Return the original response
        return _
      })
      .catch(_ => {
        // Reject pending promises on error
        inflight.get(key)?.forEach(([resolve, reject]) => reject(_))
        inflight.delete(key)
        throw _
      })
  }
}

// To call a single middleware
const cache = cacheMiddleware(1000)
wretch("https://httpbun.org/get").middlewares([cache]).get()

// To chain middlewares
wretch("https://httpbun.org/get").middlewares([
  logMiddleware(),
  delayMiddleware(1000),
  shortCircuitMiddleware()
]).get().text(text => console.log(text))

// To test the cache middleware more thoroughly
const wretchCache = wretch("https://httpbun.org").middlewares([cacheMiddleware(500)])
const printResource = (url, timeout = 0) => {
  return new Promise(resolve => setTimeout(async () => {
    wretchCache.url(url).get().notFound(console.error).text(resource => {
      console.log(resource)
      resolve(resource)
    })
  }, timeout))
}
// The resource url, change it to an invalid route to check the error handling
const resourceUrl = "/mix/s=200/b64=YWVhY2YyYWYtODhlNi00ZjgxLWEwYjAtNzdhMTIxNTA0Y2E4"
// Only two actual requests are made here even though there are 30 calls
await Promise.all(Array.from({ length: 10 }).flatMap(() =>
  [
    printResource(resourceUrl),
    printResource(resourceUrl, 200),
    printResource(resourceUrl, 700)
  ]
))
```

</details>

# Limitations

## [Cloudflare Workers](https://workers.cloudflare.com/)

It seems like using `wretch` in a Cloudflare Worker environment is not possible out of the box, as the Cloudflare `Response` implementation does not implement the [`type`](https://developer.mozilla.org/en-US/docs/Web/API/Response/type) property and throws an error when trying to access it.

#### Please check the issue [#159](https://github.com/elbywan/wretch/issues/159) for more information.

### Workaround

The following middleware should fix the issue (thanks @jimmed 🙇):

```js
wretch().middlewares([
  (next) => async (url, opts) => {
    const response = await next(url, opts);
    try {
      Reflect.get(response, "type", response);
    } catch (error) {
      Object.defineProperty(response, "type", {
        get: () => "default",
      });
    }
    return response;
  },
])
```

## Headers Case Sensitivity

The [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object from the Fetch API uses the [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) class to store headers under the hood.
This class is case-insensitive, meaning that setting both will actually appends the value to the same key:

```js
const headers = new Headers();
headers.append("Accept", "application/json");
headers.append("accept", "application/json");
headers.forEach((value, key) => console.log(key, value));
// prints: accept application/json, application/json
```

When using `wretch`, please be mindful of this limitation and avoid setting the same header multiple times with a different case:

```js
wretch("https://httpbun.org/post")
  .headers({ "content-type": "application/json" })
  // .json is a shortcut for .headers("Content-Type": "application/json").post().json()
  .json({ foo: "bar" })
  // Wretch stores the headers inside a plain javascript object and will not deduplicate them.
  // Later on when fetch builds the Headers object the content type header will be set twice
  // and its value will be "application/json, application/json".
  // Ultimately this is certainly not what you want.
```

#### Please check the issue [#80](https://github.com/elbywan/wretch/issues/80) for more information.

### Workaround

You can use the following middleware to deduplicate headers (thanks @jimmed 🙇):

```js
export const manipulateHeaders =
  callback => next => (url, { headers, ...opts }) => {
    const nextHeaders = callback(new Headers(headers))
    return next(url, { ...opts, headers: nextHeaders })
  }

export const dedupeHeaders = (dedupeHeaderLogic = {}) => {
  const deduperMap = new Map(
    Object.entries(dedupeHeaderLogic).map(([k, v]) => [k.toLowerCase(), v]),
  )
  const dedupe = key =>
    deduperMap.get(key.toLowerCase()) ?? (values => new Set(values))

  return manipulateHeaders((headers) => {
    Object.entries(headers.raw()).forEach(([key, values]) => {
      const deduped = Array.from(dedupe(key)(values))
      headers.delete(key)
      deduped.forEach((value, index) =>
        headers[index ? 'append' : 'set'](key.toLowerCase(), value),
      )
    })
    return headers
  })
}

// By default, it will deduplicate identical values for a given header. This can be used as follows:
wretch().middlewares([dedupeHeaders()])
// If there is a specific header for which the defaults cause problems, then you can provide a callback to handle deduplication yourself:
wretch().middlewares([
  dedupeHeaders({
    Accept: (values) => values.filter(v => v !== '*/*')
  })
])
```

# Migration Guides

Comprehensive migration guides are available for upgrading between major versions:

- **[Migration Guide: v2 to v3](MIGRATION_V2_V3.md)**
- **[Migration Guide: v1 to v2](MIGRATION_V1_V2.md)**

# License

MIT

