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
	A tiny (~2KB g-zipped) wrapper built around <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch">fetch</a> with an intuitive syntax.
</h4>
<h5 align="center">
    <i>f[ETCH] [WR]apper</i>
</h6>

<br>

##### Wretch 2.11 is now live 🎉 ! Please have a look at the [releases](https://github.com/elbywan/wretch/releases) and the [changelog](https://github.com/elbywan/wretch/blob/master/CHANGELOG.md) after each update for new features and breaking changes. If you want to try out the hot stuff, please look into the [dev](https://github.com/elbywan/wretch/tree/dev) branch.

##### And if you like the library please consider becoming a [sponsor](https://github.com/sponsors/elbywan) ❤️.

# Features

#### `wretch` is a small wrapper around [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) designed to simplify the way to perform network requests and handle responses.

- 🪶 **Small** - core is less than 2KB g-zipped
- 💡 **Intuitive** - lean API, handles errors, headers and (de)serialization
- 🧊 **Immutable** - every call creates a cloned instance that can then be reused safely
- 🔌 **Modular** - plug addons to add new features, and middlewares to intercept requests
- 🧩 **Isomorphic** - compatible with modern browsers, Node.js 14+ and Deno
- 🦺 **Type safe** - strongly typed, written in TypeScript
- ✅ **Proven** - fully covered by unit tests and widely used
- 💓 **Maintained** - alive and well for many years

# Table of Contents

- [**Motivation**](#motivation)
- [**Installation**](#installation)
- [**Compatibility**](#compatibility)
- [**Usage**](#usage)
- [**Api**](#api-)
- [**Addons**](#addons)
- [**Middlewares**](#middlewares)
- [**Migration from v1**](#migration-from-v1)
- [**License**](#license)

# Motivation

#### Because having to write a second callback to process a response body feels awkward.

Fetch needs a second callback to process the response body.

```javascript
fetch("examples/example.json")
  .then(response => response.json())
  .then(json => {
    //Do stuff with the parsed json
  });
```

Wretch does it for you.

```javascript
// Use .res for the raw response, .text for raw text, .json for json, .blob for a blob ...
wretch("examples/example.json")
  .get()
  .json(json => {
    // Do stuff with the parsed json
  });
```

#### Because manually checking and throwing every request error code is tedious.

Fetch won’t reject on HTTP error status.

```javascript
fetch("anything")
  .then(response => {
    if(!response.ok) {
      if(response.status === 404) throw new Error("Not found")
      else if(response.status === 401) throw new Error("Unauthorized")
      else if(response.status === 418) throw new Error("I'm a teapot !")
      else throw new Error("Other error")
    }
    else // ...
  })
  .then(data => /* ... */)
  .catch(error => { /* ... */ })
```

Wretch throws when the response is not successful and contains helper methods to handle common codes.

```javascript
wretch("anything")
  .get()
  .notFound(error => { /* ... */ })
  .unauthorized(error => { /* ... */ })
  .error(418, error => { /* ... */ })
  .res(response => /* ... */)
  .catch(error => { /* uncaught errors */ })
```

#### Because sending a json object should be easy.

With fetch you have to set the header, the method and the body manually.

```javascript
fetch("endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ "hello": "world" })
}).then(response => /* ... */)
// Omitting the data retrieval and error management parts…
```

With wretch, you have shorthands at your disposal.

```javascript
wretch("endpoint")
  .post({ "hello": "world" })
  .res(response => /* ... */)
```

#### Because configuration should not rhyme with repetition.

A Wretch object is immutable which means that you can reuse previous instances safely.

```javascript
// Cross origin authenticated requests on an external API
const externalApi = wretch("http://external.api") // Base url
  // Authorization header
  .auth(`Bearer ${token}`)
  // Cors fetch options
  .options({ credentials: "include", mode: "cors" })
  // Handle 403 errors
  .resolve((_) => _.forbidden(handle403));

// Fetch a resource
const resource = await externalApi
  // Add a custom header for this request
  .headers({ "If-Unmodified-Since": "Wed, 21 Oct 2015 07:28:00 GMT" })
  .get("/resource/1")
  .json(handleResource);

// Post a resource
externalApi
  .url("/resource")
  .post({ "Shiny new": "resource object" })
  .json(handleNewResourceResult);
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

  // ... //
</script>
```

# Compatibility

## Browsers

`wretch@^2` is compatible with modern browsers only. For older browsers please use `wretch@^1`.

## Node.js

Wretch is compatible with and tested in _Node.js >= 14_. Older versions of node may work
but it is not guaranteed.

### Polyfills (Node.js < 18)

**Starting from Node.js 18, [node includes experimental fetch support](https://nodejs.org/en/blog/announcements/v18-release-announce/). Wretch will work without installing any polyfill.**

For older versions, the Node.js standard library does not provide a native implementation of fetch (and other Browsers-only APIs) and polyfilling is mandatory.

_The non-global way (preferred):_

```javascript
import fetch, { FormData } from "node-fetch"

// w is a reusable wretch instance
const w = wretch().polyfills({
  fetch,
  FormData,
});
```

_Globally:_

```javascript
import fetch, { FormData } from "node-fetch";

// Either mutate the global object…
global.fetch = fetch;
global.FormData = FormData;

// …or use the static wretch.polyfills method to impact every wretch instance created afterwards.
wretch.polyfills({
  fetch,
  FormData,
});
```

## Deno

Works with [Deno](https://deno.land/) >=
[0.41.0](https://github.com/denoland/deno/releases/tag/v0.41.0) out of the box.

Types should be imported from `/dist/types.d.ts`.

```ts
// You can import wretch from any CDN that serve ESModules.
import wretch from "https://cdn.skypack.dev/wretch";

const text = await wretch("https://httpstat.us").get("/200").text();
console.log(text); // -> 200 OK
```

# Usage

## Import

```typescript
// ECMAScript modules
import wretch from "wretch"
// CommonJS
const wretch = require("wretch")
// Global variable (script tag)
window.wretch
```

## Minimal Example

```js
import wretch from "wretch"

// Instantiate and configure wretch
const api =
  wretch("https://jsonplaceholder.typicode.com", { mode: "cors" })
    .errorType("json")
    .resolve(r => r.json())

try {
  // Fetch users
  const users = await api.get("/users")
  // Find all posts from a given user
  const user = users.find(({ name }) => name === "Nicholas Runolfsdottir V")
  const postsByUser = await api.get(`/posts?userId=${user.id}`)
  // Create a new post
  const newPost = await api.url("/posts").post({
    title: "New Post",
    body: "My shiny new post"
  })
  // Patch it
  await api.url("/posts/" + newPost.id).patch({
    title: "Updated Post",
    body: "Edited body"
  })
  // Fetch it
  await api.get("/posts/" + newPost.id)
} catch (error) {
  // The API could return an empty object - in which case the status text is logged instead.
  const message =
    typeof error.message === "object" && Object.keys(error.message).length > 0
      ? JSON.stringify(error.message)
      : error.response.statusText
  console.error(`${error.status}: ${message}`)
}
```

## Chaining

**A high level overview of the successive steps that can be chained to perform a request and parse the result.**

```ts
// First, instantiate wretch
wretch(baseUrl, baseOptions)
```

_The "request" chain starts here._

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

```ts
  // Optional - You can chain error handlers here
  .<catcher(s)>()
  // Required - Specify the data type you need, which will be parsed and handed to you
  .<response type>()
  // >> Ends the response chain.
```

_From this point on, wretch returns a standard Promise._

```ts
  .then(…)
  .catch(…)
```

# [API 🔗](https://elbywan.github.io/wretch/api)

> 💡 The API documentation is now autogenerated and hosted separately, click the links access it.

### [Static Methods 🔗](https://elbywan.github.io/wretch/api/functions/index.default)

These methods are available from the main default export and can be used to instantiate wretch and configure it globally.

```js
import wretch from "wretch"

wretch.options({ mode: "cors" })

let w = wretch("http://domain.com/", { cache: "default" })
```

### [Helper Methods 🔗](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#accept)

Helper Methods are used to configure the request and program actions.

```js
w = w
  .url("/resource/1")
  .headers({ "Cache-Control": no-cache })
  .content("text/html")
```

### [Body Types 🔗](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#body)

Specify a body type if uploading data. Can also be added through the HTTP Method argument.

```js
w = w.body("<html><body><div/></body></html>")
```

### [HTTP Methods 🔗](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#delete)

Sets the HTTP method and sends the request.

Calling an HTTP method ends the request chain and returns a response chain.
You can pass optional url and body arguments to these methods.

```js
// These shorthands:
wretch().get("/url");
wretch().post({ json: "body" }, "/url");
// Are equivalent to:
wretch().url("/url").get();
wretch().json({ json: "body" }).url("/url").post();
```

**NOTE:** if the body argument is an `Object` it is assumed that it is a JSON payload and it will have the same behaviour as calling `.json(body)` unless the `Content-Type` header has been set to something else beforehand.


### [Catchers 🔗](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#badRequest)

Catchers are optional, but if none are provided an error will still be thrown for http error codes and it will be up to you to catch it.

```js
wretch("...")
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

```ts
type WretchError = Error & {
  status: number;
  response: WretchResponse;
  text?: string;
  json?: Object;
};
```

The original request is passed along the error and can be used in order to
perform an additional request.

```js
wretch("/resource")
  .get()
  .unauthorized(async (error, req) => {
    // Renew credentials
    const token = await wretch("/renewtoken").get().text();
    storeToken(token);
    // Replay the original request with new credentials
    return req.auth(token).get().unauthorized((err) => {
      throw err;
    }).json();
  })
  .json()
  // The promise chain is preserved as expected
  // ".then" will be performed on the result of the original request
  // or the replayed one (if a 401 error was thrown)
  .then(callback);
```

### [Response Types 🔗](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain#arrayBuffer)

Setting the final response body type ends the chain and returns a regular promise.

All these methods accept an optional callback, and will return a Promise
resolved with either the return value of the provided callback or the expected
type.

```js
// Without a callback
wretch("...").get().json().then(json => /* json is the parsed json of the response body */)
// Without a callback using await
const json = await wretch("...").get().json()
// With a callback the value returned is passed to the Promise
wretch("...").get().json(json => "Hello world!").then(console.log) // => Hello world!
```

_If an error is caught by catchers, the response type handler will not be
called._

# Addons

Addons are separate pieces of code that you can import and plug into `wretch` to add new features.

```js
import FormDataAddon from "wretch/addons/formData"
import QueryStringAddon from "wretch/addons/queryString"

// Add both addons
const w = wretch().addon(FormDataAddon).addon(QueryStringAddon)

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
w = w.query({ reset: true }, true);
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
wretch("...").addon(FormDataAddon).formData(form, ["ignored"]).post();
```

### [FormUrl 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_formUrl.FormUrlAddon)

Adds a method to serialize a `application/x-www-form-urlencoded` body from an object.

```js
import FormUrlAddon from "wretch/addons/formUrl"

const form = { a: 1, b: { c: 2 } };
const alreadyEncodedForm = "a=1&b=%7B%22c%22%3A2%7D";

// Automatically sets the content-type header to "application/x-www-form-urlencoded"
wretch("...").addon(FormUrlAddon).formUrl(form).post();
wretch("...").addon(FormUrlAddon).formUrl(alreadyEncodedForm).post();
```

### [Abort 🔗](https://elbywan.github.io/wretch/api/functions/addons_abort.default)

Adds the ability to abort requests and set timeouts using AbortController and signals under the hood.

```js
import AbortAddon from "wretch/addons/abort"
```

_Only compatible with browsers that support
[AbortControllers](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
Otherwise, you could use a (partial)
[polyfill](https://www.npmjs.com/package/abortcontroller-polyfill)._

Use cases :

```js
const [c, w] = wretch("...")
  .addon(AbortAddon())
  .get()
  .onAbort((_) => console.log("Aborted !"))
  .controller();

w.text((_) => console.log("should never be called"));
c.abort();

// Or :

const controller = new AbortController();

wretch("...")
  .addon(AbortAddon())
  .signal(controller)
  .get()
  .onAbort((_) => console.log("Aborted !"))
  .text((_) => console.log("should never be called"));

controller.abort();
```

```js
// 1 second timeout
wretch("...").addon(AbortAddon()).get().setTimeout(1000).json(_ =>
  // will not be called if the request timeouts
)
```

### [BasicAuth 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_basicAuth.BasicAuthAddon)

Adds the ability to set the `Authorization` header for the [basic authentication scheme](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme) without the need to manually encode the username/password.

Also, allows using URLs with `wretch` that contain credentials, which would otherwise throw an error.

```js
import BasicAuthAddon from "wretch/addons/basicAuth"

const user = "user"
const pass = "pass"

// Automatically sets the Authorization header to "Basic " + <base64 encoded credentials>
wretch("...").addon(BasicAuthAddon).basicAuth(user, pass).get()

// Allows using URLs with credentials in them
wretch(`https://${user}:${pass}@...`).addon(BasicAuthAddon).get()
```

### [Progress 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_progress.ProgressResolver)

Adds the ability to monitor progress when downloading a response.

_Compatible with all platforms implementing the [TransformStream WebAPI](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream#browser_compatibility)._


```js
import ProgressAddon from "wretch/addons/progress"

wretch("some_url")
  .addon(ProgressAddon())
  .get()
  // Called with the number of bytes loaded and the total number of bytes to load
  .progress((loaded, total) => {
    console.log(`${(loaded / total * 100).toFixed(0)}%`)
  })
  .text()
```

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

> **💡 By default, the request will be retried if the response status is not in the 2xx range.**
>
> ```js
> // Replace the default condition with a custom one to avoid retrying on 4xx errors:
> until: (response, error) => !!response && (response.ok || (response.status >= 400 && response.status < 500))
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
    until: (response, error) => !!response && response.ok,
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
const res = await wretch("...")
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
  const response = new Response()
  response.text = () => Promise.resolve(opts.method + "@" + url)
  response.json = () => Promise.resolve({ url, method: opts.method })
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
        inflight.get(key).forEach((([resolve, reject]) => resolve(_.clone()))
        // Remove the inflight pending promises
        inflight.delete(key)
        // Return the original response
        return _
      })
      .catch(_ => {
        // Reject pending promises on error
        inflight.get(key).forEach(([resolve, reject]) => reject(_))
        inflight.delete(key)
        throw _
      })
  }
}

// To call a single middleware
const cache = cacheMiddleware(1000)
wretch("...").middlewares([cache]).get()

// To chain middlewares
wretch("...").middlewares([
  logMiddleware(),
  delayMiddleware(1000),
  shortCircuitMiddleware()
}).get().text(_ => console.log(text))

// To test the cache middleware more thoroughly
const wretchCache = wretch().middlewares([cacheMiddleware(1000)])
const printResource = (url, timeout = 0) =>
  setTimeout(_ => wretchCache.url(url).get().notFound(console.error).text(console.log), timeout)
// The resource url, change it to an invalid route to check the error handling
const resourceUrl = "/"
// Only two actual requests are made here even though there are 30 calls
for(let i = 0; i < 10; i++) {
  printResource(resourceUrl)
  printResource(resourceUrl, 500)
  printResource(resourceUrl, 1500)
}
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
wretch(url)
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

# Migration from v1

## Philosophy

Wretch has been **completely rewritten** with the following goals in mind:

- reduce its size by making it modular
- preserve the typescript type coverage
- improve the API by removing several awkward choices

## Compatibility

`wretch@1` was transpiled to es5, `wretch@2` is now transpiled to es2018.
Any "modern" browser and Node.js versions >= 14 should parse the library without issues.

If you need compatibility with older browsers/nodejs versions then either stick with v1, use poyfills
or configure `@babel` to make it transpile wretch.

## Addons

Some features that were part of `wretch` v1 are now split apart and must be imported through addons.
It is now needed to pass the Addon to the [`.addon`](#addonaddon-wretchaddon) method to register it.

Please refer to the [Addons](#addons) documentation.

 ```js
/* Previously (wretch@1) */
import wretch from "wretch"

wretch.formData({ hello: "world" }).query({ check: true })

/* Now (wretch@2) */
import FormDataAddon from "wretch/addons/formData"
import QueryStringAddon from "wretch/addons/queryString"
import baseWretch from "wretch"

// Add both addons
const wretch = baseWretch().addon(FormDataAddon).addon(QueryStringAddon)

// Additional features are now available
wretch.formData({ hello: "world" }).query({ check: true })
```

## Typescript

Types have been renamed and refactored, please update your imports accordingly and refer to the [typescript api documentation](https://elbywan.github.io/wretch/api).

## API Changes

### Replace / Mixin arguments

Some functions used to have a `mixin = true` argument that could be used to merge the value, others a `replace = false` argument performing the opposite.
In v2 there are only `replace = false` arguments but the default behaviour should be preserved.

```js
/* Previously (wretch@1) */
wretch.options({ credentials: "same-origin" }, false) // false: do not merge the value
wretch.options({ credentials: "same-origin" }) // Default behaviour stays the same

/* Now (wretch@2) */
wretch.options({ credentials: "same-origin" }, true) // true: replace the existing value
wretch.options({ credentials: "same-origin" }) // Default behaviour stays the same
```

### HTTP methods extra argument

In v1 it was possible to set fetch options while calling the http methods to end the request chain.

```js
/* Previously (wretch@1) */
wretch("...").get({ my: "option" })
```

This was a rarely used feature and the extra argument now appends a string to the base url.

```js
/* Now (wretch@2) */
wretch("https://base.com").get("/resource/1")
```

### Replay function

The `.replay` function has been renamed to [`.fetch`](https://elbywan.github.io/wretch/api/interfaces/index.Wretch#fetch).

# License

MIT

