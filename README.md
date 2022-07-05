<h1 align="center">
	<a href="https://elbywan.github.io/wretch"><img src="assets/wretch.svg" alt="wretch-logo" width="220px"></a><br>
	<br>
    <a href="https://elbywan.github.io/wretch">Wretch</a><br>
	<br>
  <a href="https://github.com/elbywan/wretch/actions/workflows/ci.yml"><img alt="travis-badge" src="https://github.com/elbywan/wretch/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/wretch"><img alt="npm-badge" src="https://img.shields.io/npm/v/wretch.svg?colorB=ff733e" height="20"></a>
  <a href="https://www.npmjs.com/package/wretch"><img alt="npm-downloads-badge" src="https://img.shields.io/npm/dm/wretch.svg?colorB=53aabb" height="20"></a>
  <a href="https://coveralls.io/github/elbywan/wretch?branch=master"><img src="https://coveralls.io/repos/github/elbywan/wretch/badge.svg?branch=master" alt="Coverage Status"></a>
  <a href="https://automate.browserstack.com/public-build/R3dTcUtRNThKQjVGdStBL2xDMjIzOXpqY2lzTlZ2TmdnWC9JekpaNWJDYz0tLUsrWjE3WEM5NTVuWG9BdUhDMjVuRWc9PQ==--2146089f82a924d2a8091ea89f3cfbc74091595d"><img src='https://automate.browserstack.com/badge.svg?badge_key=R3dTcUtRNThKQjVGdStBL2xDMjIzOXpqY2lzTlZ2TmdnWC9JekpaNWJDYz0tLUsrWjE3WEM5NTVuWG9BdUhDMjVuRWc9PQ==--2146089f82a924d2a8091ea89f3cfbc74091595d'/></a>
  <a href="https://bundlephobia.com/result?p=wretch"><img src='https://img.shields.io/bundlephobia/minzip/wretch.svg'/></a>
  <a href="https://github.com/elbywan/wretch/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license-badge" height="20"></a>
</h1>
<h4 align="center">
	A tiny (~1.7KB g-zipped) wrapper built around <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch">fetch</a> with an intuitive syntax.
</h4>
<h5 align="center">
    <i>f[ETCH] [WR]apper</i>
</h6>

<br>

##### Wretch 2.0 is now live 🎉 ! Please check out the [changelog](https://github.com/elbywan/wretch/blob/master/CHANGELOG.md) after each update for new features and breaking changes. If you want to try out the hot stuff, please look into the [dev](https://github.com/elbywan/wretch/tree/dev) branch.

##### A collection of middlewares is available through the [wretch-middlewares](https://github.com/elbywan/wretch-middlewares) package! 📦

# Features

#### `wretch` is a small wrapper around [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) designed to simplify the way to perform and handle network requests and responses.

- 🪶 Small size (less than 2KB g-zipped)
- 💡 Intuitive - lean API, handles errors, headers and serialization
- 🧊 Immutable - every call creates a cloned instance
- 🔌 Modular - features can be added with Addons
- 🤸 Flexible - behaviour can be fully customized by Middlewares
- 💽 Isomorphic - compatible with modern browsers, node.js 14+ and deno
- 🦺 Type safe - built with TypeScript

And some additional reasons to use `wretch`:

- ⚔ Battle tested - fully covered by unit tests
- ✅ Proven - used by many companies in production
- 💓 Alive - maintained for many years

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

_Fetch needs a second callback to process the response body._

```javascript
fetch("examples/example.json")
  .then(response => response.json())
  .then(json => {
    //Do stuff with the parsed json
  });
```

_Wretch does it for you._

```javascript
// Use .res for the raw response, .text for raw text, .json for json, .blob for a blob ...
wretch("examples/example.json")
  .get()
  .json(json => {
    // Do stuff with the parsed json
  });
```

#### Because manually checking and throwing every request error code is tedious.

_Fetch won’t reject on HTTP error status._

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

_Wretch throws when the response is not successful and contains helper methods to handle common codes._

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

_With fetch you have to set the header, the method and the body manually._

```javascript
fetch("endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ "hello": "world" })
}).then(response => /* ... */)
// Omitting the data retrieval and error management parts…
```

_With wretch, you have shorthands at your disposal._

```javascript
wretch("endpoint")
  .post({ "hello": "world" })
  .res(response => /* ... */)
```

#### Because configuration should not rhyme with repetition.

_A Wretch object is immutable which means that you can reuse configured instances._

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
    - https://www.jsdelivr.com/package/npm/wretch
    - https://www.skypack.dev/view/wretch
    - https://cdnjs.com/libraries/wretch
    - …
-->

<!-- UMD import as window.wretch -->
<script src="https://unpkg.com/wretch/dist/bundle/wretch.all.min.js"></script>

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

Wretch is compatible with and tested in _Node >= 14_. Older versions of node may work
but is not guaranteed.

🥳 Starting from node 18, [node includes experimental fetch
support](https://nodejs.org/en/blog/announcements/v18-release-announce/). Wretch will
work without installing any polyfill.

For older versions of node, Wretch requires installing
[FormData](https://github.com/form-data/form-data) and
[fetch](https://www.npmjs.com/package/node-fetch) polyfills.

### Polyfills

Since the `node.js` standard library does not provide a native implementation of fetch (and other Browsers-only APIs), polyfilling is mandatory.

_The non-global way (preferred):_

```javascript
// w is a reusable wretch instance
const w = wretch().polyfills({
  fetch: require("node-fetch"),
  FormData: require("form-data"),
  URLSearchParams: require("url").URLSearchParams,
});
```

_Globally:_

```javascript
// Either mutate the global object…
global.fetch = require("node-fetch");
global.FormData = require("form-data");
global.URLSearchParams = require("url").URLSearchParams;

// …or use the static wretch.polyfills method to impact every wretch instance created afterwards.
wretch.polyfills({
  fetch: require("node-fetch"),
  FormData: require("form-data"),
  URLSearchParams: require("url").URLSearchParams,
});
```

## Deno

Works with [Deno](https://deno.land/) >=
[0.41.0](https://github.com/denoland/deno/releases/tag/v0.41.0) out of the box.

```ts
// You can import wretch from any CDN that serve ESModules.
import wretch from "https://cdn.pika.dev/wretch";

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

## Code

A high level overview of the successive steps that can be chained to perform a request and parse the result.

```javascript
// Instantiate wretch.
wretch(baseUrl, baseOptions)
  /*
    --------------------------------
    The "request" chain starts here.
    --------------------------------
  */
 .[helper method(s)]()
  // Optional - A set of helper methods to set the default options, set accept header, change the current url…
 .[body type]()
  // Optional - Serialize an object to json or FormData formats and sets the body & header field if needed
 .[http method]()
  // Required - Sends the get/put/post/delete/patch request.
  // Ends the request chain.
  /*
    Fetch is called here, after the request chain ends and before the response chain starts.
    The request is sent, and from this point on you can chain catchers and call a response type handler.

    ---------------------------------
    The "response" chain starts here.
    ---------------------------------
  */
 .[catcher(s)]()
  // Optional - You can chain error handlers here
 .[response type]()
  // Required - Specify the data type you need, which will be parsed and handed to you
  // Ends the response chain.
  /*
    From this point on, wretch returns a standard Promise so you can continue chaining actions afterwards.
  */
  .then(/* ... */)
  .catch(/* ... */)
```

# [API 🔗](https://elbywan.github.io/wretch/api)

> 💡 The API documentation is now autogenerated and hosted separately. Please click the links to check it out.

### [Static Methods 🔗](https://elbywan.github.io/wretch/api/modules/index.default.html)

These methods are available from the main default export and can be used to instantiate wretch and configure it globally.

```js
import wretch from "wretch"

wretch.options({ mode: "cors" })

let w = wretch("http://domain.com/", { cache: "default" })
```

### [Helper Methods 🔗](https://elbywan.github.io/wretch/api/interfaces/index.Wretch.html)

Helper Methods are used to configure the request and program actions.

```js
w = w
  .url("/resource/1")
  .headers({ "Cache-Control": no-cache })
  .content("text/html")
```

### [Body Types 🔗](https://elbywan.github.io/wretch/api/interfaces/index.Wretch.html)

Specify a body type if uploading data. Can also be added through the HTTP Method argument.

```js
w = w.body("<html><body><div/></body></html>")
```

### [HTTP Methods 🔗](https://elbywan.github.io/wretch/api/interfaces/index.Wretch.html)

Setus the HTTP method and sends the request.

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


## [Catchers 🔗](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain.html)

Catchers are optional, but if none are provided an error will still be thrown for http error codes and it will be up to you to catch it.

The error passed to catchers is enhanced with additional properties.

```ts
type WretchError = Error & {
  status: number;
  response: WretchResponse;
  text?: string;
  json?: Object;
};
```

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

## [Response Types 🔗](https://elbywan.github.io/wretch/api/interfaces/index.WretchResponseChain.html)

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

## [QueryString 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_queryString.QueryStringAddon.html)

Used to construct and append the query string part of the URL from an object.

```js
import QueryStringAddon from "wretch/addons/queryString"
```

## [FormData 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_formData.FormDataAddon.html)

Adds a helper method to serialize a `multipart/form-data` body from an object.

```js
import FormDataAddon from "wretch/addons/formData"
```

## [FormUrl 🔗](https://elbywan.github.io/wretch/api/interfaces/addons_formUrl.FormUrlAddon.html)

Adds a method to serialize a `application/x-www-form-urlencoded` body from an object.

```js
import FormUrlAddon from "wretch/addons/formUrl"
```

## [Abort 🔗](https://elbywan.github.io/wretch/api/modules/addons_abort.html)

Adds the ability to abort requests using AbortController and signals under the hood.

```js
import AbortAddon from "wretch/addons/abort"
```

_Only compatible with browsers that support
[AbortControllers](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
Otherwise, you could use a (partial)
[polyfill](https://www.npmjs.com/package/abortcontroller-polyfill)._

Use case :

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

## [Performance 🔗](https://elbywan.github.io/wretch/api/modules/addons_perfs.html)

Adds the ability to measure requests using the Performance Timings API.

Uses the Performance API (browsers & node.js) to expose timings related to the underlying request.

> 💡 Make sure to follow the additional instructions in the documentation to setup node.js if necessary.

# Middlewares

Middlewares are functions that can intercept requests before being processed by
Fetch. Wretch includes a helper to help replicate the
[middleware](http://expressjs.com/en/guide/using-middleware.html) style.

### Official Middlewares package

Check out [wretch-middlewares](https://github.com/elbywan/wretch-middlewares),
the official collection of middlewares.

## Signature

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

### middlewares(middlewares: ConfiguredMiddleware[], clear = false)

Add middlewares to intercept a request before being sent.

```javascript
/* A simple delay middleware. */
const delayMiddleware = delay => next => (url, opts) => {
  return new Promise(res => setTimeout(() => res(next(url, opts)), delay))
}

// The request will be delayed by 1 second.
wretch("...").middlewares([
  delayMiddleware(1000)
]).get().res(_ => /* ... */)
```

## Context

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

## Advanced examples

<details>
  <summary>Show me the code</summary>
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

# Migration from v1

## Addons

Some methods that were part of `wretch` are now split and stored inside addons.
It is now needed to import and pass the Addon to the [`.addon`](#addonaddon-wretchaddon) method to register the features.

Please refer to the [Addons](#addons) documentation.

## Typescript

Types have been renamed and refactored, please update your imports accordingly.

## Replace / Mixin arguments

Some functions used to have a `mixin = true` argument, others a `replace = false` argument doing the opposite.
In v2 there are only `replace = false` arguments.

## HTTP method - Options argument

In v1 it was possible to set fetch options while calling the http methods enfind the request chain.

```js
// v1
wretch("...").get({ my: "option" })
```

This argument now appends to the base url instead.

```js
// v2
wretch("https://base.com").get("/resource/1")
```

# License

MIT

# Credits

This project uses automated node.js & browser unit tests. The latter are a provided courtesy of:

<a href="https://www.browserstack.com/"><img src="assets/browserstack-logo.png" alt="browserstack-logo" height="100"></a>
