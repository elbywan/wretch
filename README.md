<h1 align="center">
	<img src="https://cdn.rawgit.com/elbywan/wretch/08831345/wretch.svg" alt="wretch-logo" width="220px"><br>
	<br>
    wretch<br>
	<br>
	<a href="https://travis-ci.org/elbywan/wretch"><img alt="travis-badge" src="https://travis-ci.org/elbywan/wretch.svg?branch=master"></a>
	<a href="https://www.npmjs.com/package/wretch"><img alt="npm-badge" src="https://img.shields.io/npm/v/wretch.svg" height="20"></a>
	<a href="https://coveralls.io/github/elbywan/wretch?branch=master"><img src="https://coveralls.io/repos/github/elbywan/wretch/badge.svg?branch=master" alt="Coverage Status"></a>
	<a href="https://github.com/elbywan/wretch/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license-badge" height="20"></a>
</h1>
<h4 align="center">
	A tiny (&lt; 2.2Kb g-zipped) wrapper built around fetch with an intuitive syntax.
</h4>
<h5 align="center">
    <i>f[ETCH] [WR]apper</i>
</h6>

<br>

##### Important : Wretch is in active development ! Please check out the [changelog](https://github.com/elbywan/wretch/blob/master/CHANGELOG.md) after each update for new features and breaking changes. If you want to try out the hot stuff, look at the [dev](https://github.com/elbywan/wretch/tree/dev) branch.

# Table of Contents

* [Motivation](#motivation)
* [Installation](#installation)
* [Compatibility](#compatibility)
* [Usage](#usage)
* [Api](#api)
* [License](#license)

# Motivation

#### Because having to write two callbacks for a simple request is awkward.

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
wretch("examples/example.json").get().json(json => {
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
  .json({ "hello": "world" })
  .post()
  .res(response => /* ... */)
```

#### Because configuration should not rhyme with repetition.

```javascript
// Wretch is immutable which means that you can configure, store and reuse objects

const corsWretch = wretch().options({ credentials: "include", mode: "cors" })

// Sends a cors request to http://mycrossdomainapi.com
corsWretch.url("http://mycrossdomainapi.com").get().res(response => /* ... */)

// Adding a specific header and a base url without modifying the original object
const corsWretch2 = corsWretch.url("http://myendpoint.com").headers({ "X-HEADER": "VALUE" })
// Post json to http://myendpoint.com/json/postdata
corsWretch2.url("/json/postdata").json({ a: 1 }).post()

// Reuse the original cors wretch object
const corsWretch3 = corsWretch.url("http://myotherendpoint.com").accept("application/json")
// Get json from http://myotherendpoint.com/data/1
corsWretch3.url("/data/1").get().json(myjson => /* ... */)
// Get json from http://myotherendpoint.com/data/2
corsWretch3.url("/data/2").get().json(myjson => /* ... */)
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

For older environment without fetch support, you should get a [polyfill](https://github.com/github/fetch).

## Node.js

Works with any [FormData](https://github.com/form-data/form-data) or [fetch](https://www.npmjs.com/package/node-fetch) polyfills.

```javascript
// The global way :

global.fetch = require("node-fetch")
global.FormData = require("form-data")
global.URLSearchParams = require("url").URLSearchParams

// Or the non-global way :

const fetch = require("node-fetch")
const FormData = require("form-data")

wretch().polyfills({
    fetch: fetch,
    FormData: FormData,
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
     // [ Required, ends the request chain]
     // Performs the get/put/post/delete/patch request

  /* Fetch is called at this time. */
  /* The request is sent, and from this point on you can chain catchers and call a response type handler. */

  /* The "response" chain. */

 .[catcher(s)]()
    // [ Optional ]
    // You can chain error handlers here
 .[response type]()
    // [ Required, ends the response chain]
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

Create a new Wretcher object with an url and [vanilla fetch options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).

## Helper Methods

*Helper methods are optional and can be chained.*

| [url](#urlurl-string-replace-boolean--false) | [query](#queryqp-object) | [options](#optionsoptions-object-mixin-boolean--false) | [headers](#headersheadervalues-object) | [accept](#acceptheadervalue-string) | [content](#contentheadervalue-string) | [catcher](#catchercode-number-catcher-error-wretchererror--void) | [defaults](#defaultsopts-object-mixin-boolean--false) | [errorType](#errortypemethod-text--json--text) | [polyfills](#polyfillspolyfills-object) |
|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|

#### url(url: string, replace: boolean = false)

Appends or replaces the url.

```js
wretch().url("...").get().json(/* ... */)

// Can be used to set a base url

// Subsequent requests made using the 'blogs' object will be prefixed with "http://mywebsite.org/api/blogs"
const blogs = wretch("http://mywebsite.org/api/blogs")

// Perfect for CRUD apis
const id = await blogs.json({ name: "my blog" }).post().json(_ => _.id)
const blog = await blogs.url(`/${id}`).get().json()
console.log(blog.name)

await blogs.url(`/${id}`).delete().res()

// And to replace the base url if needed :
const noMoreBlogs = blogs.url("http://mywebsite.org/", true)
```

#### query(qp: Object)

Converts a javascript object to query parameters, then appends this query string to the current url.

```js
let w = wretch("http://example.com")
// url is http://example.com
w = w.query({ a: 1, b: 2 })
// url is now http://example.com?a=1&b=2
w = w.query({ c: 3, d: [4, 5] })
// url is now http://example.com?c=3&d=4&d=5
```

#### options(options: Object, mixin: boolean = true)

Set the fetch options.

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

Set request headers.

```js
wretch("...")
  .headers({ "Content-Type": "text/plain", Accept: "application/json" })
  .body("my text")
  .post()
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

#### catcher(errorId: number | string, catcher: (error: WretcherError) => void)

Adds a [catcher](https://github.com/elbywan/wretch#catchers) which will be called on every subsequent request error.

Very useful when you need to perform a repetitive action on a specific error code.

```js
const w = wretcher()
  .catcher(404, err => redirect("/routes/notfound", err.message))
  .catcher(500, err => flashMessage("internal.server.error"))
  .error("SyntaxError", err => log("bad.json"))

// No need to catch 404 or 500 code or the json parsing error, they are already taken care of.
w.url("http://myapi.com/get/something").get().json(json => /* ... */)

// Default catchers can be overridden if needed.
w.url("...").notFound(err => /* overrides the default 'redirect' catcher */)
```

#### defaults(opts: Object, mixin: boolean = false)

Set default fetch options which will be used for every subsequent requests.

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

| [body](#bodycontents-any) | [json](#jsonjsobject-object) | [formData](#formdataformobject-object) | [formUrl](formurlinput--object--string) |
|-----|-----|-----|-----|

#### body(contents: any)

Set the request body with any content.

```js
wretch("...").body("hello").put()
```

#### json(jsObject: Object)

Sets the content type header, stringifies an object and sets the request body.

```js
const jsonObject = { a: 1, b: 2, c: 3 }
wretch("...").json(jsonObject).post()
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

#### formUrl(input : Object | string)

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

*You can pass the fetch options here if you prefer.*

| [get](#getopts--) | [delete](#deleteopts--) | [put](#putopts--) | [patch](#patchopts--) | [post](#postopts--) |
|-----|-----|-----|-----|-----|

#### get(opts = {})

Perform a get request.

```js
wretch("...").get({ credentials: "same-origin" })
```

#### delete(opts = {})

Perform a delete request.

```js
wretch("...").delete({ credentials: "same-origin" })
```

#### put(opts = {})

Perform a put request.

```js
wretch("...").json({...}).put({ credentials: "same-origin" })
```

#### patch(opts = {})

Perform a patch request.

```js
wretch("...").json({...}).patch({ credentials: "same-origin" })
```

#### post(opts = {})

Perform a post request.

```js
wretch("...").json({...}).post({ credentials: "same-origin" })
```

## Catchers

*Catchers are optional, but if you do not provide them an error will still be thrown in case of an http error code received.*

*Catchers can be chained.*

| [badRequest](#badrequestcb-error-wretchererror--any) | [unauthorized](#unauthorizedcb-error-wretchererror--any) | [forbidden](#forbiddencb-error-wretchererror--any) | [notFound](#notfoundcb-error-wretchererror--any) | [timeout](#timeoutcb-error-wretchererror--any) | [internalError](#internalerrorcb-error-wretchererror--any) | [error](#errorcode-number-cb-error-wretchererror--any) |
|-----|-----|-----|-----|-----|-----|-----|

```ts
type WretcherError = Error & { status: number, response: Response, text?: string, json?: Object }
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

#### badRequest(cb: (error: WretcherError) => any)

Syntactic sugar for `error(400, cb)`.

#### unauthorized(cb: (error: WretcherError) => any)

Syntactic sugar for `error(401, cb)`.

#### forbidden(cb: (error: WretcherError) => any)

Syntactic sugar for `error(403, cb)`.

#### notFound(cb: (error: WretcherError) => any)

Syntactic sugar for `error(404, cb)`.

#### timeout(cb: (error: WretcherError) => any)

Syntactic sugar for `error(418, cb)`.

#### internalError(cb: (error: WretcherError) => any)

Syntactic sugar for `error(500, cb)`.

#### error(errorId: number | string, cb: (error: WretcherError) => any)

Catch a specific error given its code or name and perform the callback.

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

| [Abortable requests](#abortable-requests-experimental) | [Performance API](#performance-api-experimental) |
|-----|-----|

### Abortable requests (experimental)

*No polyfills for node.js yet ! Your browser absolutely needs to support [AbortControllers](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).*

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

Catch an AbortError and perform the callback.

### Performance API (experimental)

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

const fetchPolyfill =
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

# License

MIT
