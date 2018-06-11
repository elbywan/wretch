<h1 align="center">
	<a href="https://elbywan.github.io/wretch"><img src="https://cdn.rawgit.com/elbywan/wretch/08831345/wretch.svg" alt="wretch-logo" width="220px"></a><br>
	<br>
    <a href="https://elbywan.github.io/wretch">Wretch</a><br>
	<br>

  <a href="https://travis-ci.org/elbywan/wretch"><img alt="travis-badge" src="https://travis-ci.org/elbywan/wretch.svg?branch=master"></a>
  <a href="https://www.npmjs.com/package/wretch"><img alt="npm-badge" src="https://img.shields.io/npm/v/wretch.svg?colorB=ff733e" height="20"></a>
  <a href="https://www.npmjs.com/package/wretch"><img alt="npm-downloads-badge" src="https://img.shields.io/npm/dm/wretch.svg?colorB=53aabb" height="20"></a>
  <a href="https://coveralls.io/github/elbywan/wretch?branch=master"><img src="https://coveralls.io/repos/github/elbywan/wretch/badge.svg?branch=master" alt="Coverage Status"></a>
  <a href="https://www.browserstack.com/automate/public-build/Y0ZoenBIa3lqRCtqTFBYV3A4a2dybVk3TUJXZHFFbFRmdFBiczVXbWJFST0tLW9mbEFSOFE3YlVKV0d5cHNsQ3hHQVE9PQ==--46a969ee3fb5db55f2641aee799838ed1b2f8ef6"><img src='https://www.browserstack.com/automate/badge.svg?badge_key=Y0ZoenBIa3lqRCtqTFBYV3A4a2dybVk3TUJXZHFFbFRmdFBiczVXbWJFST0tLW9mbEFSOFE3YlVKV0d5cHNsQ3hHQVE9PQ==--46a969ee3fb5db55f2641aee799838ed1b2f8ef6'/></a>
  <a href="https://bundlephobia.com/result?p=wretch"><img src='https://img.shields.io/bundlephobia/minzip/wretch.svg'/></a>
  <a href="https://github.com/elbywan/wretch/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license-badge" height="20"></a>
</h1>
<h4 align="center">
	A tiny (&lt; 2.7Kb g-zipped) wrapper built around fetch with an intuitive syntax.
</h4>
<h5 align="center">
    <i>f[ETCH] [WR]apper</i>
</h6>

<br>

##### Wretch 1.3 is now live 🎉 ! Please check out the [changelog](https://github.com/elbywan/wretch/blob/master/CHANGELOG.md) after each update for new features and breaking changes. If you want to try out the hot stuff, look at the [dev](https://github.com/elbywan/wretch/tree/dev) branch.

##### A collection of middlewares is available through the [wretch-middlewares](https://github.com/elbywan/wretch-middlewares) package! 📦

# Table of Contents

* [Motivation](#motivation)
* [Installation](#installation)
* [Compatibility](#compatibility)
* [Usage](#usage)
* [Api](#api)
* [License](#license)

# Motivation

#### Because having to write a second callback to process a response body feels awkward.

```javascript
// Fetch needs a second callback to process the response body

fetch("examples/example.json")
  .then(response => response.json())
  .then(json => {
    //Do stuff with the parsed json
  })
```

```javascript
// Wretch does it for you

// Use .res for the raw response, .text for raw text, .json for json, .blob for a blob ...
wretch("examples/example.json")
  .get()
  .json(json => {
    // Do stuff with the parsed json
  })
```

#### Because manually checking and throwing every request error code is fastidious.

```javascript
// Fetch won’t reject on HTTP error status

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

```javascript
// Wretch throws when the response is not successful and contains helper methods to handle common codes

wretch("anything")
  .get()
  .notFound(error => { /* ... */ })
  .unauthorized(error => { /* ... */ })
  .error(418, error => { /* ... */ })
  .res(response => /* ... */)
  .catch(error => { /* uncaught errors */ })
```

#### Because sending a json object should be easy.

```javascript
// With fetch you have to set the header, the method and the body manually

fetch("endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ "hello": "world" })
}).then(response => /* ... */)
// Omitting the data retrieval and error management parts
```

```javascript
// With wretch, you have shorthands at your disposal

wretch("endpoint")
  .post({ "hello": "world" })
  .res(response => /* ... */)
```

#### Because configuration should not rhyme with repetition.

```javascript
// Wretch object is immutable which means that you can configure, store and reuse instances

// Cross origin authenticated requests on an external API
const externalApi = wretch()
  // Set the base url
  .url("http://external.api")
  // Authorization header
  .auth(`Bearer ${ token }`)
  // Cors fetch options
  .options({ credentials: "include", mode: "cors" })
  // Handle 403 errors
  .resolve(_ => _.forbidden(handle403))

// Fetch a resource
externalApi
  .url("/resource/1")
  // Add a custom header for this request
  .headers({ "If-Unmodified-Since": "Wed, 21 Oct 2015 07:28:00 GMT" })
  .get()
  .json(handleResource)
// Post a resource
externalApi
  .url("/resource")
  .post({ "Shiny new": "resource object" })
  .json(handleNewResourceResult)
```

# Installation

## Npm

```sh
npm i wretch
```

## Clone

```sh
git clone https://github.com/elbywan/wretch
cd wretch
npm install
npm start
```

# Compatibility

## Browsers

Wretch is compatible with modern browsers out of the box.

For older environments without fetch support, you should get a [polyfill](https://github.com/github/fetch).

*A battery of unit tests is run with every build on node .js and browsers.*<br>*Automated browser unit testing is a provided courtesy of:*

 <a href="https://www.browserstack.com/"><img src="assets/browserstack-logo.png" alt="browserstack-logo" height="75"></a>

## Node.js

Works with any [FormData](https://github.com/form-data/form-data) or [fetch](https://www.npmjs.com/package/node-fetch) polyfills.

```javascript
// The global way :

global.fetch = require("node-fetch")
global.FormData = require("form-data")
global.URLSearchParams = require("url").URLSearchParams

// Or the non-global way :

wretch().polyfills({
    fetch: require("node-fetch"),
    FormData: require("form-data"),
    URLSearchParams: require("url").URLSearchParams
})
```

# Usage

**Wretch is bundled using the UMD format (@`dist/bundle/wretch.js`) alongside es2015 modules (@`dist/index.js`) and typescript definitions.**

## Import

```html
<!--- "wretch" will be attached to the global window object. -->
<script src="https://unpkg.com/wretch"></script>
```

```typescript
// es2015 modules
import wretch from "wretch"

// commonjs
var wretch = require("wretch")
```

## Code

**Wretcher objects are immutable.**

```javascript
wretch(url, options)

  /* The "request" chain. */

 .[helper method(s)]()
     // [ Optional ]
     // A set of helper methods to set the default options, set accept header, change the current url ...
 .[body type]()
     // [ Optional ]
     // Serialize an object to json or FormData formats and sets the body & header field if needed
 .[http method]()
     // [ Required, ends the request chain ]
     // Performs the get/put/post/delete/patch request

  /* Fetch is called at this time. */
  /* The request is sent, and from this point on you can chain catchers and call a response type handler. */

  /* The "response" chain. */

 .[catcher(s)]()
    // [ Optional ]
    // You can chain error handlers here
 .[response type]()
    // [ Required, ends the response chain ]
    // Specify the data type you need, which will be parsed and handed to you

  /* From this point wretch returns a standard Promise, so you can continue chaining actions afterwards. */

  .then(/* ... */)
  .catch(/* ... */)
```

# API

* [Helper Methods](#helper-methods)
* [Body Types](#body-types)
* [Http Methods](#http-methods)
* [Catchers](#catchers)
* [Response Types](#response-types)
* [Extras](#extras)

------

#### wretch(url = "", opts = {})

Creates a new Wretcher object with an url and [vanilla fetch options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).

## Helper Methods

*Helper methods are optional and can be chained.*

| [url](#urlurl-string-replace-boolean--false) | [query](#queryqp-object--string-replace-boolean) | [options](#optionsoptions-object-mixin-boolean--true) | [headers](#headersheadervalues-object) | [accept](#acceptheadervalue-string) | [content](#contentheadervalue-string) | [auth](#authheadervalue-string) | [catcher](#catchererrorid-number--string-catcher-error-wretchererror-originalrequest-wretcher--void) | [resolve](#resolvedoresolve-chain-responsechain-originalrequest-wretcher--responsechain--promise-clear--false) | [defer](#defercallback-originalrequest-wretcher-url-string-options-object--wretcher-clear--false) | [defaults](#defaultsopts-object-mixin-boolean--false) | [errorType](#errortypemethod-text--json--text) | [polyfills](#polyfillspolyfills-object) |
|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|

#### url(url: string, replace: boolean = false)

Appends or replaces the url.

```js
wretch().url("...").get().json(/* ... */)

// Can be used to set a base url

// Subsequent requests made using the 'blogs' object will be prefixed with "http://mywebsite.org/api/blogs"
const blogs = wretch("http://mywebsite.org/api/blogs")

// Perfect for CRUD apis
const id = await blogs.post({ name: "my blog" }).json(_ => _.id)
const blog = await blogs.url(`/${id}`).get().json()
console.log(blog.name)

await blogs.url(`/${id}`).delete().res()

// And to replace the base url if needed :
const noMoreBlogs = blogs.url("http://mywebsite.org/", true)
```

#### query(qp: object | string, replace: boolean)

Converts a javascript object to query parameters, then appends this query string to the current url.
String values are used as the query string verbatim.

Pass `true` as the second argument to replace existing query parameters.

```js
let w = wretch("http://example.com")
// url is http://example.com
w = w.query({ a: 1, b: 2 })
// url is now http://example.com?a=1&b=2
w = w.query({ c: 3, d: [4, 5] })
// url is now http://example.com?a=1&b=2c=3&d=4&d=5
w = w.query("five&six&seven=eight")
// url is now http://example.com?a=1&b=2c=3&d=4&d=5&five&six&seven=eight
w = w.query({ reset: true }, true)
// url is now  http://example.com?reset=true
```

#### options(options: Object, mixin: boolean = true)

Sets the fetch options.

```js
wretch("...").options({ credentials: "same-origin" })
```

Wretch being immutable, you can store the object for later use.

```js
const corsWretch = wretch().options({ credentials: "include", mode: "cors" })

corsWretch.url("http://endpoint1").get()
corsWretch.url("http://endpoint2").get()
```

You can override instead of mixing in the existing options by passing a boolean flag.

```js
// By default options mixed in :

wretch()
  .options({ headers: { "Accept": "application/json" }})
  .options({ encoding: "same-origin", headers: { "X-Custom": "Header" }})

/*
{
  headers: { "Accept": "application/json", "X-Custom": "Header" },
  encoding: "same-origin"
}
*/

// With the flag, options are overridden :

wretch()
  .options({ headers: { "Accept": "application/json" }})
  .options({ encoding: "same-origin", headers: { "X-Custom": "Header" }}, false)

/*
{
  headers: { "X-Custom": "Header" },
  encoding: "same-origin"
}
*/
```

#### headers(headerValues: Object)

Sets the request headers.

```js
wretch("...")
  .headers({ "Content-Type": "text/plain", Accept: "application/json" })
  .post("my text")
  .json()
```

#### accept(headerValue: string)

Shortcut to set the "Accept" header.

```js
wretch("...").accept("application/json")
```

#### content(headerValue: string)

Shortcut to set the "Content-Type" header.

```js
wretch("...").content("application/json")
```

#### auth(headerValue: string)

Shortcut to set the "Authorization" header.

```js
wretch("...").auth("Basic d3JldGNoOnJvY2tz")
```

#### catcher(errorId: number | string, catcher: (error: WretcherError, originalRequest: Wretcher) => void)

Adds a [catcher](https://github.com/elbywan/wretch#catchers) which will be called on every subsequent request error.

Very useful when you need to perform a repetitive action on a specific error code.

```js
const w = wretch()
  .catcher(404, err => redirect("/routes/notfound", err.message))
  .catcher(500, err => flashMessage("internal.server.error"))
  .error("SyntaxError", err => log("bad.json"))

// No need to catch 404 or 500 code or the json parsing error, they are already taken care of.
w.url("http://myapi.com/get/something").get().json(json => /* ... */)

// Default catchers can be overridden if needed.
w.url("...").notFound(err => /* overrides the default 'redirect' catcher */)
```

The original request is passed along the error and can be used in order to perform an additional request.

```js
const reAuthOn401 = wretch()
  .catcher(401, async (error, request) => {
    // Renew credentials
    const token = await wretch("/renewtoken").get().text()
    storeToken(token)
    // Replay the original request with new credentials
    return request.auth(token).get().unauthorized(err => { throw err }).json()
  })

reAuthOn401.url("/resource")
  .get()
  .json() // <- Will only be called for the original promise
  .then(callback) // <- Will be called for the original OR the replayed promise result
```

#### defer(callback: (originalRequest: Wretcher, url: string, options: Object) => Wretcher, clear = false)

Defer wretcher methods that will be chained and called just before the request is performed.

```js
/* Small fictional example: deferred authentication */

// If you cannot retrieve the auth token while configuring the wretch object you can use .defer to postpone the call
const api = wretch("...").defer((w, url, options)  => {
  // If we are hitting the route /user…
  if(/\/user/.test(url)) {
    const { token } = options.context
    return w.auth(token)
  }
  return w
})

// ... //

const token = await getToken(request.session.user)

// .auth gets called here automatically
api.options({
  context: { token }
}).get().res()
```

#### resolve(doResolve: (chain: ResponseChain, originalRequest: Wretcher) => ResponseChain | Promise<any>, clear = false)

Programs a resolver which will automatically be injected to perform response chain tasks.

Very useful when you need to perform repetitive actions on the wretch response.

*The clear argument, if set to true, removes previously defined resolvers.*

```js
// Program "response" chain actions early on
const w = wretch()
  .resolve(resolver => resolver
    .perfs(_ =>  /* monitor every request */)
    .json(_ => _ /* automatically parse and return json */))

const myJson = await w.url("http://a.com").get()
// Equivalent to wretch()
//  .url("http://a.com")
//  .get()
//     <- the resolver chain is automatically injected here !
//  .perfs(_ =>  /* ... */)
//  .json(_ => _)
```

#### defaults(opts: Object, mixin: boolean = false)

Sets default fetch options which will be used for every subsequent requests.

```js
// Interestingly enough, default options are mixed in :

wretch().defaults({ headers: { "Accept": "application/json" }})

// The fetch request is sent with both headers.
wretch("...", { headers: { "X-Custom": "Header" }}).get()
```

```js
// You can mix in with the existing options instead of overriding them by passing a boolean flag :

wretch().defaults({ headers: { "Accept": "application/json" }})
wretch().defaults({ encoding: "same-origin", headers: { "X-Custom": "Header" }}, true)

/* The new options are :
{
  headers: { "Accept": "application/json", "X-Custom": "Header" },
  encoding: "same-origin"
}
*/
```

#### errorType(method: "text" | "json" = "text")

Sets the method (text, json ...) used to parse the data contained in the response body in case of an HTTP error.

Persists for every subsequent requests.

```js
wretch().errorType("json")

wretch("http://server/which/returns/an/error/with/a/json/body")
  .get()
  .res()
  .catch(error => {
    // error[errorType] (here, json) contains the parsed body
    console.log(error.json))
  }
```

#### polyfills(polyfills: Object)

Sets the non-global polyfills which will be used for every subsequent calls.

```javascript
const fetch = require("node-fetch")
const FormData = require("form-data")

wretch().polyfills({
    fetch: fetch,
    FormData: FormData,
    URLSearchParams: require("url").URLSearchParams
})
```

## Body Types

*A body type is only needed when performing put/patch/post requests with a body.*

| [body](#bodycontents-any) | [json](#jsonjsobject-object) | [formData](#formdataformobject-object) | [formUrl](#formurlinput--object--string) |
|-----|-----|-----|-----|

#### body(contents: any)

Sets the request body with any content.

```js
wretch("...").body("hello").put()
// Note that calling an 'http verb' method with the body as an argument is equivalent:
wretch("...").put("hello")
```

#### json(jsObject: Object)

Sets the content type header, stringifies an object and sets the request body.

```js
const jsonObject = { a: 1, b: 2, c: 3 }
wretch("...").json(jsonObject).post()
// Note that calling an 'http verb' method with the object body as an argument is equivalent:
wretch("...").post(jsonObject)

```

#### formData(formObject: Object)

Converts the javascript object to a FormData and sets the request body.

```js
const form = {
  hello: "world",
  duck: "Muscovy"
}
wretch("...").formData(form).post()
```

#### formUrl(input: Object | string)

Converts the input parameter to an url encoded string and sets the content-type header and body.
If the input argument is already a string, skips the conversion part.

```js
const form = { a: 1, b: { c: 2 }}
const alreadyEncodedForm = "a=1&b=%7B%22c%22%3A2%7D"

// Automatically sets the content-type header to "application/x-www-form-urlencoded"
wretch("...").formUrl(form).post()
wretch("...").formUrl(alreadyEncodedForm).post()
```

## Http Methods

**Required**

*You can pass optional fetch options and body arguments to these methods as a shorthand.*

```js
// This shorthand:
wretch().post({ json: 'body' }, { credentials: "same-origin" })
// Is equivalent to:
wretch().json({ json: 'body'}).options({ credentials: "same-origin" }).post()
```

| [get](#getoptions) | [delete](#deleteoptions) | [put](#putbody-options) | [patch](#patchbody-options) | [post](#postbody-options) | [head](#headoptions) | [opts](#optsopts) |
|-----|-----|-----|-----|-----|-----|-----|

#### get(options)

Performs a get request.

```js
wretch("...").get()
```

#### delete(options)

Performs a delete request.

```js
wretch("...").delete()
```

#### put(body, options)

Performs a put request.

```js
wretch("...").json({...}).put()
```

#### patch(body, options)

Performs a patch request.

```js
wretch("...").json({...}).patch()
```

#### post(body, options)

Performs a post request.

```js
wretch("...").json({...}).post()
```

#### head(options)

Performs a head request.

```js
wretch("...").head()
```
#### opts(options)

Performs an options request.

```js
wretch("...").opts()
```

## Catchers

*Catchers are optional, but if you do not provide them an error will still be thrown in case of an http error code received.*

*Catchers can be chained.*

| [badRequest](#badrequestcb-error-wretchererror-originalrequest-wretcher--any) | [unauthorized](#unauthorizedcb-error-wretchererror-originalrequest-wretcher--any) | [forbidden](#forbiddencb-error-wretchererror-originalrequest-wretcher--any) | [notFound](#notfoundcb-error-wretchererror-originalrequest-wretcher--any) | [timeout](#timeoutcb-error-wretchererror-originalrequest-wretcher--any) | [internalError](#internalerrorcb-error-wretchererror-originalrequest-wretcher--any) | [error](#errorerrorid-number--string-cb-error-wretchererror-originalrequest-wretcher--any) |
|-----|-----|-----|-----|-----|-----|-----|

```ts
type WretcherError = Error & { status: number, response: WretcherResponse, text?: string, json?: Object }
```

```js
wretch("...")
  .get()
  .badRequest(err => console.log(err.status))
  .unauthorized(err => console.log(err.status))
  .forbidden(err => console.log(err.status))
  .notFound(err => console.log(err.status))
  .timeout(err => console.log(err.status))
  .internalError(err => console.log(err.status))
  .error(418, err => console.log(err.status))
  .res()
```

#### badRequest(cb: (error: WretcherError, originalRequest: Wretcher) => any)

Syntactic sugar for `error(400, cb)`.

#### unauthorized(cb: (error: WretcherError, originalRequest: Wretcher) => any)

Syntactic sugar for `error(401, cb)`.

#### forbidden(cb: (error: WretcherError, originalRequest: Wretcher) => any)

Syntactic sugar for `error(403, cb)`.

#### notFound(cb: (error: WretcherError, originalRequest: Wretcher) => any)

Syntactic sugar for `error(404, cb)`.

#### timeout(cb: (error: WretcherError, originalRequest: Wretcher) => any)

Syntactic sugar for `error(418, cb)`.

#### internalError(cb: (error: WretcherError, originalRequest: Wretcher) => any)

Syntactic sugar for `error(500, cb)`.

#### error(errorId: number | string, cb: (error: WretcherError, originalRequest: Wretcher) => any)

Catches a specific error given its code or name and perform the callback.

---------

The original request is passed along the error and can be used in order to perform an additional request.

```js
wretch("/resource")
  .get()
  .unauthorized(async (error, req) => {
    // Renew credentials
    const token = await wretch("/renewtoken").get().text()
    storeToken(token)
    // Replay the original request with new credentials
    return req.auth(token).get().unauthorized(err => { throw err }).json()
  })
  .json()
  // The promise chain is preserved as expected
  // ".then" will be performed on the result of the original request
  // or the replayed one (if a 401 error was thrown)
  .then(callback)
```

## Response Types

**Required**

*If an error is caught by catchers, the response type handler will not be called.*

| [res](#rescb-response--response--any) | [json](#jsoncb-json--object--any) | [blob](#blobcb-blob--blob--any) | [formData](#formdatacb-fd--formdata--any) | [arrayBuffer](#arraybuffercb-ab--arraybuffer--any) | [text](#textcb-text--string--any) |
|-----|-----|-----|-----|-----|-----|

#### res(cb: (response : Response) => any)

Raw Response handler.

```js
wretch("...").get().res(response => console.log(response.url))
```

#### json(cb: (json : Object) => any)

Json handler.

```js
wretch("...").get().json(json => console.log(Object.keys(json)))
```

#### blob(cb: (blob : Blob) => any)

Blob handler.

```js
wretch("...").get().blob(blob => /* ... */)
```

#### formData(cb: (fd : FormData) => any)

FormData handler.

```js
wretch("...").get().formData(formData => /* ... */)
```

#### arrayBuffer(cb: (ab : ArrayBuffer) => any)

ArrayBuffer handler.

```js
wretch("...").get().arrayBuffer(arrayBuffer => /* ... */)
```

#### text(cb: (text : string) => any)

Text handler.

```js
wretch("...").get().text(txt => console.log(txt))
```

## Extras

*A set of extra features.*

| [Abortable requests](#abortable-requests) | [Performance API](#performance-api) | [Middlewares](#middlewares) |
|-----|-----|-----|

### Abortable requests

*Only compatible with browsers that support [AbortControllers](https://developer.mozilla.org/en-US/docs/Web/API/AbortController). Otherwise, you could use a (partial) [polyfill](https://www.npmjs.com/package/abortcontroller-polyfill).*

Use case :

```js
const [c, w] = wretch("...")
  .get()
  .onAbort(_ => console.log("Aborted !"))
  .controller()

w.text(_ => console.log("should never be called"))
c.abort()

// Or :

const controller = new AbortController()

wretch("...")
  .signal(controller)
  .get()
  .onAbort(_ => console.log("Aborted !"))
  .text(_ => console.log("should never be called"))

c.abort()
```

### signal(controller: AbortController)

*Used at "request time", like an helper.*

Associates a custom controller with the request.
Useful when you need to use your own AbortController, otherwise wretch will create a new controller itself.

```js
const controller = new AbortController()

// Associates the same controller with multiple requests

wretch("url1")
  .signal(controller)
  .get()
  .json(_ => /* ... */)
wretch("url2")
  .signal(controller)
  .get()
  .json(_ => /* ... */)

// Aborts both requests

controller.abort()
```

#### setTimeout(time: number, controller?: AbortController)

*Used at "response time".*

Aborts the request after a fixed time. If you use a custom AbortController associated with the request, pass it as the second argument.

```js
// 1 second timeout
wretch("...").get().setTimeout(1000).json(_ => /* will not be called in case of a timeout */)
```

#### controller()

*Used at "response time".*

Returns the automatically generated AbortController alongside the current wretch response as a pair.

```js
// We need the controller outside the chain
const [c, w] = wretch("url")
  .get()
  .controller()

// Resume with the chain
w.onAbort(_ => console.log("ouch")).json(_ => /* ... */)

/* Later on ... */
c.abort()
```

#### onAbort(cb: (error: AbortError) => any)

*Used at "response time" like a catcher.*

Catches an AbortError and performs the callback.

### Performance API

#### perfs(cb: (timings: PerformanceTiming) => void)

Takes advantage of the Performance API ([browsers](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API) & [node.js](https://nodejs.org/api/perf_hooks.html)) to expose timings related to the underlying request.

Browser timings are very accurate, node.js only contains raw measures.

```js
// Use perfs() before the response types (text, json, ...)
wretch("...")
  .get()
  .perfs(timings => {
    /* Will be called when the timings are ready. */
    console.log(timings.startTime)
  })
  .res()
  /* ... */
```

For node.js, there is a little extra work to do :

```js
// Node.js 8.5+ only
const { performance, PerformanceObserver } = require("perf_hooks")

wretch().polyfills({
  fetch: function(url, opts) {
    performance.mark(url + " - begin")
    return fetch(url, opts).then(_ => {
      performance.mark(url + " - end")
      performance.measure(_.url, url + " - begin", url + " - end")
    })
  },
  /* other polyfills ... */
  performance: performance,
  PerformanceObserver: PerformanceObserver
})
```

### Middlewares

Middlewares are functions that can intercept requests before being processed by Fetch.
Wretch includes a helper to help replicate the [middleware](http://expressjs.com/en/guide/using-middleware.html) style.


#### Middlewares package

Check out [wretch-middlewares](https://github.com/elbywan/wretch-middlewares), the official collection of middlewares.

#### Signature

Basically a Middleware is a function having the following signature :

```ts
// A middleware accepts options and returns a configured version
type Middleware = (options?: {[key: string]: any}) => ConfiguredMiddleware
// A configured middleware (with options curried)
type ConfiguredMiddleware = (next: FetchLike) => FetchLike
// A "fetch like" function, accepting an url and fetch options and returning a response promise
type FetchLike = (url: string, opts: WretcherOptions) => Promise<WretcherResponse>
```

#### middlewares(middlewares: ConfiguredMiddleware[], clear = false)

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

#### Middleware examples

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

# License

MIT
