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
	A tiny (~2KB g-zipped) wrapper built around <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch">fetch</a> with an intuitive syntax.
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
- [**Api**](#api)
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

> If you pick the core bundle, then to plug addons you must import them separately from `/dist/bundle/addons/[addonName].min.js`

| Feature set        | Name                |
| ------------------ | ------------------- |
| Core features only | `wretch.min.js`     |
| Core + all addons  | `wretch.all.min.js` |

| Format   | Extension  |
| -------- | ---------- |
| ESM      | `.min.mjs` |
| CommonJS | `.min.cjs` |
| UMD      | `.min.js`  |

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

:partying_face: Starting from node 18, [node includes experimental fetch
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

### Overview

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

### Samples

Some coding examples to illustrate each step of the process.

#### Instantiation

Arguments are all optional.

```js
let w = wretch(
  // Base url
  "http://domain.com/",
  // Base fetch options
  { mode: "cors" }
)
```

#### The request chain

Chain helper methods to configure the request.

```js
w = w
  .url("/resource/1")
  .headers({ "Cache-Control": no-cache })
  .content("text/html")
```

Specify a body type if uploading data (optional for json).

```js
w = w.body("<html><body><div/></body></html>")
```
Setting the http method ends the chain and returns a 'response' chain.

```js
// Optional argument.
// Set the body as json and the application/json content-type header
w = w.put({ "hello": world })
```

#### The response chain

Add error catchers.

```js
w = w
  .catcher(404, err => redirect("/routes/notfound", err.message))
  .catcher(500, err => flashMessage("internal.server.error"))
```

Setting the final response body type ends the chain and returns a regular promise.

```js
const payload = await w.json()
```


# API

- [Static Methods](#static-methods)
- [Helper Methods](#helper-methods)
- [Body Types](#body-types)
- [Http Methods](#http-methods)
- [Catchers](#catchers)
- [Response Types](#response-types)

---

## Static Methods

**The following static methods are defined at the import level, do not call them from an instanciated wretch object.**

### wretch(url = "", opts = {})

Creates a new Wretch instance and set a base url and base
[fetch options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).

```js
import wretch from "wretch"

// Reusable instance
const w = wretch("https://domain.com", { mode: "cors" })
```

### options(options: object, replace = false)

Sets the default fetch options that will be stored internally when instantiating wretch objects.

```js
import wretch from "wretch"

wretch.options({ headers: { "Accept": "application/json" } });

// The fetch request is sent with both headers.
wretch("...", { headers: { "X-Custom": "Header" } }).get().res();
```

### polyfills(polyfills: object, replace = false)

Sets the default polyfills that will be stored internally when instantiating wretch objects.
Useful for browserless environments like `node.js`.

```js
import wretch from "wretch"

wretch.polyfills({
  fetch: require("node-fetch"),
  FormData: require("form-data"),
  URLSearchParams: require("url").URLSearchParams,
});

// Uses the above polyfills.
wretch("...").get().res();
```

### errorType(method: string)

Sets the default method (text, json, …) used to parse the data contained in the response body in case of an HTTP error.
As with other static methods, it will affect wretch instances created after calling this function.

```js
import wretch from "wretch"

wretch.errorType("json")

wretch("http://server/which/returns/an/error/with/a/json/body")
  .get()
  .res()
  .catch(error => {
    // error[errorType] (here, json) contains the parsed body
    console.log(error.json)
  })
```

## Helper Methods

_Helper methods are optional and can be chained._

| [url](#urlurl-string-replace-boolean--false) | [options](#optionsoptions-object-replace-boolean--false) | [headers](#headersheadervalues-object) | [accept](#acceptheadervalue-string) | [content](#contentheadervalue-string) | [auth](#authheadervalue-string) | [catcher](#catchererrorid-number--string-catcher-error-wretcherror-originalrequest-wretch--void) | [defer](#defercallback-originalrequest-wretch-url-string-options-object--wretch-clear--false) | [resolve](#resolvedoresolve-chain-wretchresponsechain-originalrequest-wretch--wretchresponsechain--promiseany-clear--false) | [errorType](#errortypemethod-string--text) | [polyfills](#polyfillspolyfills-object) |
| -------------------------------------------- | -------------------------------------------------------- | -------------------------------------- | ----------------------------------- | ------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------- |


### url(url: string, replace: boolean = false)

Appends or replaces the url.

```js
wretch("/root").url("/sub").get().json(); /* ... */

// Can be used to set a base url

// Subsequent requests made using the 'blogs' object will be prefixed with "http://domain.com/api/blogs"
const blogs = wretch("http://domain.com/api/blogs");

// Perfect for CRUD apis
const id = await blogs.post({ name: "my blog" }).json(blog => blog.id);
const blog = await blogs.get(`/${id}`).json();
console.log(blog.name);

await blogs.url(`/${id}`).delete().res();

// And to replace the base url if needed :
const noMoreBlogs = blogs.url("http://domain2.com/", true);
```

### options(options: Object, replace: boolean = false)

#### Sets the fetch options.

```js
wretch("...").options({ credentials: "same-origin" });
```

Wretch being immutable, you can store the object for later use.

```js
const corsWretch = wretch().options({ credentials: "include", mode: "cors" });

corsWretch.get("http://endpoint1");
corsWretch.get("http://endpoint2");
```

You can override instead of mixing in the existing options by passing a boolean
flag.

```js
// By default options mixed in :
let w = wretch()
  .options({ headers: { "Accept": "application/json" } })
  .options({ encoding: "same-origin", headers: { "X-Custom": "Header" } });
console.log(JSON.stringify(w._options))
// => {"encoding":"same-origin", "headers":{"Accept":"application/json","X-Custom":"Header"}}

// With the flag, options are overridden :
w = wretch()
  .options({ headers: { "Accept": "application/json" } })
  .options(
    { encoding: "same-origin", headers: { "X-Custom": "Header" } },
    true,
  );
console.log(JSON.stringify(w._options))
// => {"encoding":"same-origin","headers":{"X-Custom":"Header"}}
```

### headers(headerValues: Object)

Sets the request headers.

```js
wretch("...")
  .headers({ "Content-Type": "text/plain", Accept: "application/json" })
  .post("my text")
  .json();
```

### accept(headerValue: string)

Shortcut to set the "Accept" header.

```js
wretch("...").accept("application/json");
```

### content(headerValue: string)

Shortcut to set the "Content-Type" header.

```js
wretch("...").content("application/json");
```

### auth(headerValue: string)

Shortcut to set the "Authorization" header.

```js
wretch("...").auth("Basic d3JldGNoOnJvY2tz");
```

### catcher(errorId: number | string, catcher: (error: WretchError, originalRequest: Wretch) => void)

Adds a [catcher](https://github.com/elbywan/wretch#catchers) which will be
called on every subsequent request error.

Very useful when you need to perform a repetitive action on a specific error
code.

```js
const w = wretch()
  .catcher(404, err => redirect("/routes/notfound", err.message))
  .catcher(500, err => flashMessage("internal.server.error"))

// No need to catch the 404 or 500 codes, they are already taken care of.
w.get("http://myapi.com/get/something").json(json => /* ... */)

// Default catchers can be overridden if needed.
w
  .get("http://myapi.com/get/something")
  .notFound(err => /* overrides the default 'redirect' catcher */)
  .json(json => /* ... */)
```

The original request is passed along the error and can be used in order to
perform an additional request.

```js
const reAuthOn401 = wretch()
  .catcher(401, async (error, request) => {
    // Renew credentials
    const token = await wretch("/renewtoken").get().text();
    storeToken(token);
    // Replay the original request with new credentials
    return request.auth(token).fetch().unauthorized((err) => {
      throw err;
    }).json();
  });

reAuthOn401
  .get("/resource")
  .json() // <- Will only be called for the original promise
  .then(callback); // <- Will be called for the original OR the replayed promise result
```

### defer(callback: (originalRequest: Wretch, url: string, options: Object) => Wretch, clear = false)

Defer one or multiple request chain methods that will get called just before the request is sent.

```js
/* Small fictional example: deferred authentication */

// If you cannot retrieve the auth token while configuring the wretch object you can use .defer to postpone the call
const api = wretch("http://some-domain.com").defer((w, url, options) => {
  // If we are hitting the route /user…
  if (/\/user/.test(url)) {
    const { token } = options.context;
    return w.auth(token);
  }
  return w;
});

// ... //

const token = await getToken(request.session.user);

// .auth gets called here automatically
api.options({
  context: { token },
}).get("/user/1").res();
```

### resolve(doResolve: (chain: WretchResponseChain, originalRequest: Wretch) => WretchResponseChain | Promise<any>, clear = false)

Programs a resolver to perform response chain tasks automatically.

Very useful when you need to perform repetitive actions on the wretch response.

_The clear argument, if set to true, removes previously defined resolvers._

```js
// Program "response" chain actions early on
const w = wretch()
  .addon(PerfsAddon())
  .resolve(resolver => resolver
    .perfs(_ =>  /* monitor every request */)
    .json(_ => _ /* automatically parse and return json */))

const myJson = await w.url("http://a.com").get()
// Equivalent to:
// w.url("http://a.com")
//  .get()
//     <- the resolver chain is automatically injected here !
//  .perfs(_ =>  /* ... */)
//  .json(_ => _)
```

### errorType(method: string = "text")

Sets the method (text, json ...) used to parse the data contained in the
response body in case of an HTTP error is returned.

```js
wretch("http://server/which/returns/an/error/with/a/json/body")
  .errorType("json")
  .get()
  .res()
  .catch(error => {
    // error[errorType] (here, json) contains the parsed body
    console.log(error.json)
  })
```

### polyfills(polyfills: Object)

Sets non-global polyfills - for instance in browserless environments.

```javascript
const fetch = require("node-fetch");
const FormData = require("form-data");

wretch("http://domain.com")
  .polyfills({
    fetch: fetch,
    FormData: FormData,
    URLSearchParams: require("url").URLSearchParams,
  })
  .get()
```

## Body Types

_A body type is only needed when performing put/patch/post requests with payloads._

| [body](#bodycontents-any) | [json](#jsonjsobject-object) |
| ------------------------- | ---------------------------- |

### body(contents: any)

Sets the request body with any content.

```js
wretch("...").body("hello").put();
// Note that calling put/post methods with a non-object argument is equivalent:
wretch("...").put("hello");
```

### json(jsObject: Object)

Sets the "Content-Type" header, stringifies an object and sets the request body.

```js
const jsonObject = { a: 1, b: 2, c: 3 };
wretch("...").json(jsonObject).post();
// Note that calling an 'http verb' method with an object argument is equivalent:
wretch("...").post(jsonObject);
```

## Http Methods

**Required**

_You can pass optional url and body arguments to these methods._

```js
// These shorthands:
wretch().get("/url");
wretch().post({ json: "body" }, "/url");
// Are equivalent to:
wretch().url("/url").get();
wretch().json({ json: "body" }).url("/url").post();
```

**NOTE:** if the body argument is an `Object` it is assumed that it is a JSON payload and it will have the same behaviour as calling `.json(body)` unless the `Content-Type` header has been set to something else beforehand.

-----

| [get](#geturl) | [delete](#deleteurl) | [put](#putbody-url) | [patch](#patchbody-url) | [post](#postbody-url) | [head](#headurl) | [opts](#optsurl) |
| -------------- | -------------------- | ------------------- | ----------------------- | --------------------- | ---------------- | ---------------- |

### get(url)

Performs a [GET](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET) request.

```js
wretch("...").get();
```

### delete(url)

Performs a [DELETE](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE) request.

```js
wretch("...").delete();
```

### put(body, url)

Performs a [PUT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT) request.

```js
wretch("...").json({...}).put()
```

### patch(body, url)

Performs a [PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH) request.

```js
wretch("...").json({...}).patch()
```

### post(body, url)

Performs a [POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) request.

```js
wretch("...").json({...}).post()
```

### head(url)

Performs a [HEAD](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD) request.

```js
wretch("...").head();
```

### opts(url)

Performs an [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) request.

```js
wretch("...").opts();
```

## Catchers

_Catchers are optional, but if none are provided an error will still be
thrown for http error codes and it will be up to you to catch it._

| [badRequest](#badrequestcb-error-wretcherror-originalrequest-wretch--any) | [unauthorized](#unauthorizedcb-error-wretcherror-originalrequest-wretch--any) | [forbidden](#forbiddencb-error-wretcherror-originalrequest-wretch--any) | [notFound](#notfoundcb-error-wretcherror-originalrequest-wretch--any) | [timeout](#timeoutcb-error-wretcherror-originalrequest-wretch--any) | [internalError](#internalerrorcb-error-wretcherror-originalrequest-wretch--any) | [error](#errorerrorid-number--string-cb-error-wretcherror-originalrequest-wretch--any) | [fetchError](#fetcherrorcb-error-networkerror-originalrequest-wretch--any) |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |

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

### badRequest(cb: (error: WretchError, originalRequest: Wretch) => any)

Syntactic sugar for `error(400, cb)`.

### unauthorized(cb: (error: WretchError, originalRequest: Wretch) => any)

Syntactic sugar for `error(401, cb)`.

### forbidden(cb: (error: WretchError, originalRequest: Wretch) => any)

Syntactic sugar for `error(403, cb)`.

### notFound(cb: (error: WretchError, originalRequest: Wretch) => any)

Syntactic sugar for `error(404, cb)`.

### timeout(cb: (error: WretchError, originalRequest: Wretch) => any)

Syntactic sugar for `error(408, cb)`.

### internalError(cb: (error: WretchError, originalRequest: Wretch) => any)

Syntactic sugar for `error(500, cb)`.

### error(errorId: number | string, cb: (error: WretchError, originalRequest: Wretch) => any)

Catches a specific error given its code or name and perform the callback.

### fetchError(cb: (error: NetworkError, originalRequest: Wretch) => any)

Catches any error thrown by the fetch function and perform the callback.

---

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

## Response Types

**Required**

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

| [res](#rescb-response--response--t--promiseresponse--t) | [json](#jsoncb-json--object--t--promiseobject--t) | [blob](#blobcb-blob--blob--t--promiseblob--t) | [formData](#formdatacb-fd--formdata--t--promiseformdata--t) | [arrayBuffer](#arraybuffercb-ab--arraybuffer--t--promisearraybuffer--t) | [text](#textcb-text--string--t--promisestring--t) |
| ------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |


### res(cb?: (response : Response) => T) : Promise<Response | T>

Raw Response handler.
Check the [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Response) documentation for more details on the Response class.

```js
wretch("...").get().res((response) => console.log(response.url));
```

### json(cb?: (json : Object) => T) : Promise<Object | T>

Json handler.

```js
wretch("...").get().json((json) => console.log(Object.keys(json)));
```

### blob(cb?: (blob : Blob) => T) : Promise<Blob | T>

Blob handler.

```js
wretch("...").get().blob(blob => /* ... */)
```

### formData(cb: (fd : FormData) => T) : Promise<FormData | T>

FormData handler.

```js
wretch("...").get().formData(formData => /* ... */)
```

### arrayBuffer(cb: (ab : ArrayBuffer) => T) : Promise<ArrayBuffer | T>

ArrayBuffer handler.

```js
wretch("...").get().arrayBuffer(arrayBuffer => /* ... */)
```

### text(cb: (text : string) => T) : Promise<string | T>

Text handler.

```js
wretch("...").get().text((txt) => console.log(txt));
```

# Addons

Addons are separate pieces of code that you can import and plug into `wretch` to add new features.

### addon(addon: WretchAddon)

```js
import FormDataAddon from "wretch/addons/formData"
import QueryStringAddon from "wretch/addons/queryString"

// Add both addons
const w = wretch().addon(FormDataAddon).addon(QueryStringAddon)

// Additional features are now available
w.formData({ hello: "world" }).query({ check: true })
```

## QueryString

Used to construct and append the query string part of the URL from an object.

```js
import QueryStringAddon from "wretch/addons/queryString"
```

### query(qp: object | string, replace: boolean)

Converts a javascript object to query parameters, then appends this query string
to the current url. String values are used as the query string verbatim.

Pass `true` as the second argument to replace existing query parameters.

```js
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

##### **Note that .query is not meant to handle complex cases with nested objects.**

For this kind of usage, you can use `wretch` in conjunction with other libraries
(like [`qs`](https://github.com/ljharb/qs)).

```js
/* Using wretch with qs */

const queryObject = { some: { nested: "objects" } };
const w = wretch("https://example.com/").addon(QueryStringAddon)

// Use .qs inside .query :

w.query(qs.stringify(queryObject));

// Use .defer :

const qsWretch = w.defer((w, url, { qsQuery, qsOptions }) => (
  qsQuery ? w.query(qs.stringify(qsQuery, qsOptions)) : w
));

qsWretch
  .url("https://example.com/")
  .options({ qs: { query: queryObject } });
/* ... */
```

## FormData

Adds a method to serialize a `multipart/form-data` body from an object.

```js
import FormDataAddon from "wretch/addons/formData"
```

### formData(formObject: Object, recursive: string[] | boolean = false)

Converts the javascript object to a FormData and sets the request body.

```js
const form = {
  hello: "world",
  duck: "Muscovy",
};
wretch("...").addons(FormDataAddon).formData(form).post();
```

The `recursive` argument when set to `true` will enable recursion through all
nested objects and produce `object[key]` keys. It can be set to an array of
string to exclude specific keys.

> Warning: Be careful to exclude `Blob` instances in the Browser, and
> `ReadableStream` and `Buffer` instances when using the node.js compatible
> `form-data` package.

```js
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
wretch("...").addons(FormDataAddon).formData(form, ["ignored"]).post();
```

## FormUrl

Adds a method to serialize a `application/x-www-form-urlencoded` body from an object.

```js
import FormUrlAddon from "wretch/addons/formUrl"
```

### formUrl(input: Object | string)

Converts the input parameter to an url encoded string and sets the content-type
header and body. If the input argument is already a string, skips the conversion
part.

```js
const form = { a: 1, b: { c: 2 } };
const alreadyEncodedForm = "a=1&b=%7B%22c%22%3A2%7D";

// Automatically sets the content-type header to "application/x-www-form-urlencoded"
wretch("...").addon(FormUrlAddon).formUrl(form).post();
wretch("...").addon(FormUrlAddon).formUrl(alreadyEncodedForm).post();
```

## Abort

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

### signal(controller: AbortController)

_Belongs to the "request" chain._

Associates a custom controller with the request. Useful when you need to use
your own AbortController, otherwise wretch will create a new controller itself.

```js
const controller = new AbortController()

// Associates the same controller with multiple requests

wretch("url1")
  .addon(AbortAddon())
  .signal(controller)
  .get()
  .json(_ => /* ... */)
wretch("url2")
  .addon(AbortAddon())
  .signal(controller)
  .get()
  .json(_ => /* ... */)

// Aborts both requests

controller.abort()
```

### setTimeout(time: number, controller?: AbortController)

_Belongs to the "response" chain._

Aborts the request after a fixed time. If you use a custom AbortController
associated with the request, pass it as the second argument.

```js
// 1 second timeout
wretch("...").addon(AbortAddon()).get().setTimeout(1000).json(_ => /* will not be called in case of a timeout */)
```

### controller()

_Belongs to the "response" chain._

Returns the automatically generated AbortController alongside the current wretch
response as a pair.

```js
// We need the controller outside the chain
const [c, w] = wretch("url")
  .addon(AbortAddon())
  .get()
  .controller()

// Resume with the chain
w.onAbort(_ => console.log("ouch")).json(_ => /* ... */)

/* Later on ... */
c.abort()
```

### onAbort(cb: (error: AbortError) => any)

_Belongs to the "response" chain._

Catches an AbortError and performs the callback.

## Performance

Uses the Performance API to measure requests.

```js
import PerfsAddon from "wretch/addons/perfs"
```

### perfs(cb: (timings: PerformanceTiming) => void)

Takes advantage of the Performance API
([browsers](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API) &
[node.js](https://nodejs.org/api/perf_hooks.html)) to expose timings related to
the underlying request.

Browser timings are very accurate, node.js only contains raw measures.

```js
// Use perfs() before the response types (text, json, ...)
wretch("...")
  .addon(PerfsAddon())
  .get()
  .perfs((timings) => {
    /* Will be called when the timings are ready. */
    console.log(timings.startTime);
  })
  .res();
/* ... */
```

For node.js, there is a little extra work to do :

```js
// Node.js only
const { performance, PerformanceObserver } = require("perf_hooks");

wretch.polyfills({
  fetch: function (url, opts) {
    performance.mark(url + " - begin");
    return fetch(url, opts).then(res => {
      performance.mark(url + " - end");
      setTimeout(() => performance.measure(res.url, url + " - begin", url + " - end"), 0);
      return res;
    });
  },
  /* other polyfills ... */
  performance: performance,
  PerformanceObserver: PerformanceObserver,
});
```

# Middlewares

Middlewares are functions that can intercept requests before being processed by
Fetch. Wretch includes a helper to help replicate the
[middleware](http://expressjs.com/en/guide/using-middleware.html) style.

### Middlewares package

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
