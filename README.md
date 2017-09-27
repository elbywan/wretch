<h1 align="center">
	<img src="wretch.svg" alt="wretch-logo" width="220px"><br>
	<br>
    wretch<br>
	<br>
	<a href="https://travis-ci.org/elbywan/wretch"><img alt="travis-badge" src="https://travis-ci.org/elbywan/wretch.svg?branch=master"></a>
	<a href="https://www.npmjs.com/package/wretch"><img alt="npm-badge" src="https://badge.fury.io/js/wretch.svg" height="20"></a>
	<a href="https://coveralls.io/github/elbywan/wretch?branch=master"><img src="https://coveralls.io/repos/github/elbywan/wretch/badge.svg?branch=master" alt="Coverage Status" /></a>
</h1>
<h4 align="center">
	A tiny (&lt; 1.5Kb g-zipped) wrapper built around fetch with an intuitive syntax.
</h4>
<h5 align="center">
    <i>f[ETCH] [WR]apper</i>
</h6>

<br>

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

// sends a cors request
corsWretch.url("...").get()

// Refine the cors wretch by adding a specific header and a fixed url
const corsWretchWithUrl = corsWretch.url("http://myendpoint.com").headers({ "X-HEADER": "VALUE" })

corsWretchWithUrl.get()
corsWretchWithUrl.json({a:1}).post()

// Reuse the original cors wretch object but this time by adding a baseUrl
const corsWretchWithBaseUrl = corsWretch.baseUrl("http://myurl.com")

corsWretchWithBaseUrl("/root").get()
corsWretchWithBaseUrl("/data/1").get()
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

Works with [FormData](https://github.com/form-data/form-data) and [fetch](https://www.npmjs.com/package/node-fetch) polyfills.

```javascript
global.fetch = require("node-fetch")
global.FormData = require("form-data")
```

# Usage

**Wretch is bundled using the UMD format (@`dist/bundle/wretch.js`) alongside es2015 modules (@`dist/index.js`) and typescript definitions.**

## Import

```html
<!--- "wretch" will be attached to the global window object. -->
<script src="https://unpkg.com/wretch/dist/bundle/wretch.js"></script>
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
      // A fresh Wretcher object
  .[helper method(s)]()
      // Optional
      // A set of helper methods to set the default options, set accept header, change the current url ...
  .[body type]()
      // Optional
      // Serialize an object to json or FormData formats and sets the body & header field if needed
  .[http method]()
      // Required
      // Performs the get/put/post/delete/patch request

  /* Fetch is called at this time */

  .[catcher(s)]()
      // Optional
      // You can chain error handlers here
  .[response type]()
      // Required
      // Specify the data type you need, which will be parsed and handed to you

  /* Wretch returns a Promise, so you can continue chaining actions afterwards. */

  .then(/* ... */)
  .catch(/* ... */)
```

# API

* [Helper Methods](#helper-methods)
* [Body Types](#body-types)
* [Http Methods](#http-methods)
* [Catchers](#catchers)
* [Response Types](#response-types)

------

#### wretch(url = "", opts = {})

Create a new Wretcher object with an url and [vanilla fetch options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).

## Helper Methods

*Helper methods are optional and can be chained.*

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
    // error.message contains the parsed body
    console.log(error.message))
  }
```

#### catcher(code: number, catcher: (error: WretcherError) => void)

Adds a [catcher](https://github.com/elbywan/wretch#catchers) which will be called on every subsequent request error.

Very useful when you need to perform a repetitive action on a specific error code.

```js
const w = wretcher()
  .catcher(404, err => redirect("/routes/notfound", err.message))
  .catcher(500, err => flashMessage("internal.server.error"))

// No need to catch 404 or 500 code, they are already taken care of.
w.url("http://myapi.com/get/something").get().json(json => /* ... */)

// Default catchers can be overridden if needed.
w.url("...").notFound(err => /* overrides the default 'redirect' catcher */)
```

#### options(options: Object, mixin: boolean = false)

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

```js
// You can mix in with the existing options instead of overriding them by passing a boolean flag :

wretch()
  .options({ headers: { "Accept": "application/json" }})
  .options({ encoding: "same-origin", headers: { "X-Custom": "Header" }}, true)

/* Options mixed in :
{
  headers: { "Accept": "application/json", "X-Custom": "Header" },
  encoding: "same-origin"
}
*/
```

#### url(url: string)

Set the url.

```js
wretch({ credentials: "same-origin" }).url("...").get()
```

#### baseUrl(baseurl: string)

Returns a wretch factory (same signature as the [wretch](#wretchurl---opts--) method) which when called creates a new Wretcher object with the base url as an url prefix.

```js
// Subsequent requests made using the 'blogs' object will be prefixed with "http://mywebsite.org/api/blogs"
const blogs = wretch().baseUrl("http://mywebsite.org/api/blogs")

// Perfect for CRUD apis
const id = await blogs("").json({ name: "my blog" }).post().json(_ => _.id)
const blog = await blogs(`/${id}`).get().json()
console.log(blog.name)
await blogs(`/${id}`).delete().res()
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

## Body Types

*A body type is only needed when performing put/patch/post requests with a body.*

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

## Http Methods

**Required**

*You can pass the fetch options here if you prefer.*

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

#### error(code: number, cb: (error: WretcherError) => any)

Catch a specific error and perform the callback.

## Response Types

**Required**

*If an error is caught by catchers, the response type handler will not be called.*

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

# License

MIT
