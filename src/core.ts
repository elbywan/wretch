import { mix, extractContentType, isLikelyJsonMime } from "./utils.js"
import { JSON_MIME, CONTENT_TYPE_HEADER } from "./constants.js"
import { resolver } from "./resolver.js"
import config from "./config.js"
import type { Config } from "./config.js"
import type { WretchError, WretchOptions, WretchDeferredCallback, WretchAddon } from "./types.js"
import type { WretchResponseChain } from "./resolver.js"
import type { ConfiguredMiddleware } from "./middleware.js"

/**
 * The Wretch object used to perform easy fetch requests.
 *
 * ```ts
 * import wretch from "wretch"
 *
 * // Reusable wretch instance
 * const w = wretch("https://domain.com", { mode: "cors" })
 * ```
 *
 * Immutability : almost every method of this class return a fresh Wretch object.
 */
export interface Wretch<Self = unknown, Chain = unknown> {
  /**
   * @private @internal
   */
  _url: string,
  /**
   * @private @internal
   */
  _options: WretchOptions,
  /**
   * @private @internal
   */
  _config: Config,
  /**
   * @private @internal
   */
  _catchers: Map<number | string | symbol, (error: WretchError, originalRequest: Wretch<Self>) => void>
  /**
   * @private @internal
   */
  _resolvers: ((resolver: Chain & WretchResponseChain<Self, Chain>, originalRequest: Wretch<Self>) => any)[]
  /**
   * @private @internal
   */
  _deferred: WretchDeferredCallback<Self, Chain>[]
  /**
   * @private @internal
   */
  _middlewares: ConfiguredMiddleware[]
  /**
   * @private @internal
   */
  _addons: WretchAddon<unknown, Chain>[]

  /**
   * Register an Addon to enhance the wretch or response objects.
   *
   * ```js
   * import FormDataAddon from "wretch/addons/formData"
   * import QueryStringAddon from "wretch/addons/queryString"
   *
   * // Add both addons
   * const w = wretch().addon(FormDataAddon).addon(QueryStringAddon)
   *
   * // Additional features are now available
   * w.formData({ hello: "world" }).query({ check: true })
   * ```
   *
   * @category Helpers
   * @param addon - A Wretch addon to register
   */
  addon<W, R>(addon: WretchAddon<W, R>): W & Self & Wretch<Self & W, Chain & R>

  /**
   * Sets the method (text, json ...) used to parse the data contained in the
   * response body in case of an HTTP error is returned.
   *
   * ```js
   * wretch("http://server/which/returns/an/error/with/a/json/body")
   *   .errorType("json")
   *   .get()
   *   .res()
   *   .catch(error => {
   *     // error[errorType] (here, json) contains the parsed body
   *     console.log(error.json)
   *   })
   * ```
   *
   * @category Helpers
   * @param method - The method to call on the Fetch response to read the body and use it as the Error message
   */
  errorType(this: Self & Wretch<Self, Chain>, method: string): this

  /**
   * Sets non-global polyfills - for instance in browserless environments.
   *
   * Needed for libraries like [fetch-ponyfill](https://github.com/qubyte/fetch-ponyfill).
   *
   * ```javascript
   * const fetch = require("node-fetch");
   * const FormData = require("form-data");
   *
   * wretch("http://domain.com")
   *   .polyfills({
   *     fetch: fetch,
   *     FormData: FormData,
   *     URLSearchParams: require("url").URLSearchParams,
   *   })
   *   .get()
   * ```
   *
   * @category Helpers
   * @param polyfills - An object containing the polyfills
   * @param replace - If true, replaces the current polyfills instead of mixing in
   */
  polyfills(this: Self & Wretch<Self, Chain>, polyfills: Partial<typeof config.polyfills>, replace?: boolean): this

  /**
   * Appends or replaces the url.
   *
   * ```js
   * wretch("/root").url("/sub").get().json();
   *
   * // Can be used to set a base url
   *
   * // Subsequent requests made using the 'blogs' object will be prefixed with "http://domain.com/api/blogs"
   * const blogs = wretch("http://domain.com/api/blogs");
   *
   * // Perfect for CRUD apis
   * const id = await blogs.post({ name: "my blog" }).json(blog => blog.id);
   * const blog = await blogs.get(`/${id}`).json();
   * console.log(blog.name);
   *
   * await blogs.url(`/${id}`).delete().res();
   *
   * // And to replace the base url if needed :
   * const noMoreBlogs = blogs.url("http://domain2.com/", true);
   * ```
   *
   * @category Helpers
   * @param url - Url segment
   * @param replace - If true, replaces the current url instead of appending
   */
  url(this: Self & Wretch<Self, Chain>, url: string, replace?: boolean): this

  /**
   * Sets the fetch options.
   *
   * ```js
   * wretch("...").options({ credentials: "same-origin" });
   * ```
   *
   * Wretch being immutable, you can store the object for later use.
   *
   * ```js
   * const corsWretch = wretch().options({ credentials: "include", mode: "cors" });
   *
   * corsWretch.get("http://endpoint1");
   * corsWretch.get("http://endpoint2");
   * ```
   *
   * You can override instead of mixing in the existing options by passing a boolean
   * flag.
   *
   * ```js
   * // By default options are mixed in :
   * let w = wretch()
   *   .options({ headers: { "Accept": "application/json" } })
   *   .options({ encoding: "same-origin", headers: { "X-Custom": "Header" } });
   * console.log(JSON.stringify(w._options))
   * // => {"encoding":"same-origin", "headers":{"Accept":"application/json","X-Custom":"Header"}}
   *
   * // With the flag, options are overridden :
   * w = wretch()
   *   .options({ headers: { "Accept": "application/json" } })
   *   .options(
   *     { encoding: "same-origin", headers: { "X-Custom": "Header" } },
   *     true,
   *   );
   * console.log(JSON.stringify(w._options))
   * // => {"encoding":"same-origin","headers":{"X-Custom":"Header"}}
   * ```
   *
   * @category Helpers
   * @param options - New options
   * @param replace - If true, replaces the existing options
   */
  options(this: Self & Wretch<Self, Chain>, options: WretchOptions, replace?: boolean): this

  /**
   * Sets the request headers.
   *
   * ```js
   * wretch("...")
   *   .headers({ "Content-Type": "text/plain", Accept: "application/json" })
   *   .post("my text")
   *   .json();
   * ```
   *
   * @category Helpers
   * @param headerValues - An object containing header keys and values
   */
  headers(this: Self & Wretch<Self, Chain>, headerValues: HeadersInit): this

  /**
   * Shortcut to set the "Accept" header.
   *
   * ```js
   * wretch("...").accept("application/json");
   * ```
   *
   * @category Helpers
   * @param headerValue - Header value
   */
  accept(this: Self & Wretch<Self, Chain>, headerValue: string): this

  /**
   * Shortcut to set the "Content-Type" header.
   *
   * ```js
   * wretch("...").content("application/json");
   * ```
   *
   * @category Helpers
   * @param headerValue - Header value
   */
  content(this: Self & Wretch<Self, Chain>, headerValue: string): this

  /**
   * Shortcut to set the "Authorization" header.
   *
   * ```js
   * wretch("...").auth("Basic d3JldGNoOnJvY2tz");
   * ```
   *
   * @category Helpers
   * @param headerValue - Header value
   */
  auth(this: Self & Wretch<Self, Chain>, headerValue: string): this

  /**
   * Adds a [catcher](https://github.com/elbywan/wretch#catchers) which will be
   * called on every subsequent request error.
   *
   * Very useful when you need to perform a repetitive action on a specific error
   * code.
   *
   * ```js
   * const w = wretch()
   *   .catcher(404, err => redirect("/routes/notfound", err.message))
   *   .catcher(500, err => flashMessage("internal.server.error"))
   *
   * // No need to catch the 404 or 500 codes, they are already taken care of.
   * w.get("http://myapi.com/get/something").json()
   *
   * // Default catchers can be overridden if needed.
   * w
   * .get("http://myapi.com/get/something")
   * .notFound(err =>
   *   // overrides the default 'redirect' catcher
   *  )
   * .json()
   * ```
   *
   * The original request is passed along the error and can be used in order to
   * perform an additional request.
   *
   * ```js
   * const reAuthOn401 = wretch()
   * .catcher(401, async (error, request) => {
   *   // Renew credentials
   *   const token = await wretch("/renewtoken").get().text();
   *   storeToken(token);
   *   // Replay the original request with new credentials
   *   return request.auth(token).fetch().unauthorized((err) => {
   *     throw err;
   *   }).json();
   * });
   *
   * reAuthOn401
   * .get("/resource")
   * .json() // <- Will only be called for the original promise
   * .then(callback); // <- Will be called for the original OR the replayed promise result
   * ```
   *
   * @category Helpers
   * @param errorId - Error code or name
   * @param catcher - The catcher method
   */
  catcher(this: Self & Wretch<Self, Chain>, errorId: number | string, catcher: (error: WretchError, originalRequest: Wretch<Self>) => any): this

  /**
   * Defer one or multiple request chain methods that will get called just before the request is sent.
   *
   * ```js
   * // Small fictional example: deferred authentication
   *
   * // If you cannot retrieve the auth token while configuring the wretch object you can use .defer to postpone the call
   * const api = wretch("http://some-domain.com").defer((w, url, options) => {
   *   // If we are hitting the route /user…
   *   if (/\/user/.test(url)) {
   *     const { token } = options.context;
   *     return w.auth(token);
   *   }
   *   return w;
   * });
   *
   * // ... //
   *
   * const token = await getToken(request.session.user);
   *
   * // .auth gets called here automatically
   * api.options({
   *   context: { token },
   * }).get("/user/1").res();
   * ```
   *
   * @category Helpers
   * @param callback - Exposes the wretch instance, url and options to program deferred methods.
   * @param clear - Replace the existing deferred methods if true instead of pushing to the existing list.
   */
  defer(this: Self & Wretch<Self, Chain>, callback: WretchDeferredCallback<Self, Chain>, clear?: boolean): this

  /**
   * Programs a resolver to perform response chain tasks automatically.
   *
   * Very useful when you need to perform repetitive actions on the wretch response.
   *
   * _The clear argument, if set to true, removes previously defined resolvers._
   *
   * ```js
   * // Program "response" chain actions early on
   * const w = wretch()
   *   .addon(PerfsAddon())
   *   .resolve(resolver => resolver
   *     // monitor every request…
   *     .perfs(console.log)
   *     // automatically parse and return json…
   *     .json()
   *   )
   *
   *  const myJson = await w.url("http://a.com").get()
   *  // Equivalent to:
   *  // w.url("http://a.com")
   *  //  .get()
   *  //  <- the resolver chain is automatically injected here !
   *  //  .perfs(console.log)
   *  //  .json()
   *  ```
   *
   * @category Helpers
   * @param resolver - Resolver callback
   */
  resolve(this: Self & Wretch<Self, Chain>, resolver: (chain: Chain & WretchResponseChain<Self, Chain>, originalRequest: Wretch<Self>) => WretchResponseChain<Self, Chain> | Promise<any>, clear?: boolean): this

  /**
   * Add middlewares to intercept a request before being sent.
   *
   * ```javascript
   * // A simple delay middleware.
   * const delayMiddleware = delay => next => (url, opts) => {
   *   return new Promise(res => setTimeout(() => res(next(url, opts)), delay))
   * }
   *
   * // The request will be delayed by 1 second.
   * wretch("...").middlewares([
   *   delayMiddleware(1000)
   * ]).get().res()
   * ```
   *
   * @category Helpers
   */
  middlewares(this: Self & Wretch<Self, Chain>, middlewares: ConfiguredMiddleware[], clear?: boolean): this

  /**
   * Sets the request body with any content.
   *
   * ```js
   * wretch("...").body("hello").put();
   * // Note that calling put/post methods with a non-object argument is equivalent:
   * wretch("...").put("hello");
   * ```
   *
   * @category Body Types
   * @param contents - The body contents
   */
  body(this: Self & Wretch<Self, Chain>, contents: any): this

  /**
   * Sets the "Content-Type" header, stringifies an object and sets the request body.
   *
   * ```js
   * const jsonObject = { a: 1, b: 2, c: 3 };
   * wretch("...").json(jsonObject).post();
   * // Note that calling an 'http verb' method with an object argument is equivalent:
   * wretch("...").post(jsonObject);
   * ```
   *
   * @category Body Types
   * @param jsObject - An object which will be serialized into a JSON
   * @param contentType - A custom content type.
   */
  json(this: Self & Wretch<Self, Chain>, jsObject: object, contentType?: string): this


  /**
   * Sends the request using the accumulated fetch options.
   *
   * Can be used to replay requests.
   *
   * ```js
   * const reAuthOn401 = wretch()
   * .catcher(401, async (error, request) => {
   *   // Renew credentials
   *   const token = await wretch("/renewtoken").get().text();
   *   storeToken(token);
   *   // Replay the original request with new credentials
   *   return request.auth(token).fetch().unauthorized((err) => {
   *     throw err;
   *   }).json();
   * });
   *
   * reAuthOn401
   * .get("/resource")
   * .json() // <- Will only be called for the original promise
   * .then(callback); // <- Will be called for the original OR the replayed promise result
   * ```
   *
   * @category HTTP
   * @param method - The HTTP method to use
   * @param url - Some url to append
   * @param body - Set the body. Behaviour varies depending on the argument type, an object is considered as json.
   */
  fetch(this: Self & Wretch<Self, Chain>, method?: string, url?: string, body?: any): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a [GET](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET) request.
   *
   * ```js
   * wretch("...").get();
   * ```
   *
   * @category HTTP
   */
  get(this: Self & Wretch<Self, Chain>, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a [DELETE](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE) request.
   *
   * ```js
   * wretch("...").delete();
   * ```
   *
   * @category HTTP
   */
  delete(this: Self & Wretch<Self, Chain>, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a [PUT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT) request.
   *
   * ```js
   * wretch("...").json({...}).put()
   * ```
   *
   * @category HTTP
   */
  put(this: Self & Wretch<Self, Chain>, body?: any, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a [POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) request.
   *
   * ```js
   * wretch("...").json({...}).post()
   * ```
   *
   * @category HTTP
   */
  post(this: Self & Wretch<Self, Chain>, body?: any, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a [PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH) request.
   *
   * ```js
   * wretch("...").json({...}).patch()
   * ```
   *
   * @category HTTP
   */
  patch(this: Self & Wretch<Self, Chain>, body?: any, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a [HEAD](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD) request.
   *
   * ```js
   * wretch("...").head();
   * ```
   *
   * @category HTTP
   */
  head(this: Self & Wretch<Self, Chain>, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs an [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) request.
   *
   * ```js
   * wretch("...").opts();
   * ```
   *
   * @category HTTP
   */
  opts(this: Self & Wretch<Self, Chain>, url?: string): Chain & WretchResponseChain<Self, Chain>
}

export const core: Wretch = {
  _url: "",
  _options: {},
  _config: config,
  _catchers: new Map(),
  _resolvers: [],
  _deferred: [],
  _middlewares: [],
  _addons: [],
  addon(addon) {
    return { ...this, _addons: [...this._addons, addon], ...addon.wretch }
  },
  errorType(errorType: string) {
    return {
      ...this,
      _config: {
        ...this._config,
        errorType
      }
    }
  },
  polyfills(polyfills, replace = false) {
    return {
      ...this,
      _config: {
        ...this._config,
        polyfills: replace ? polyfills : mix(this._config.polyfills, polyfills)
      }
    }
  },
  url(_url, replace = false) {
    if (replace)
      return { ...this, _url }
    const split = this._url.split("?")
    return {
      ...this,
      _url: split.length > 1 ?
        split[0] + _url + "?" + split[1] :
        this._url + _url
    }
  },
  options(options, replace = false) {
    return { ...this, _options: replace ? options : mix(this._options, options) }
  },
  headers(headerValues) {
    return { ...this, _options: mix(this._options, { headers: headerValues || {} }) }
  },
  accept(headerValue) {
    return this.headers({ Accept: headerValue })
  },
  content(headerValue) {
    return this.headers({ [CONTENT_TYPE_HEADER]: headerValue })
  },
  auth(headerValue) {
    return this.headers({ Authorization: headerValue })
  },
  catcher(errorId, catcher) {
    const newMap = new Map(this._catchers)
    newMap.set(errorId, catcher)
    return { ...this, _catchers: newMap }
  },
  resolve(resolver, clear: boolean = false) {
    return { ...this, _resolvers: clear ? [resolver] : [...this._resolvers, resolver] }
  },
  defer(callback, clear = false) {
    return {
      ...this,
      _deferred: clear ? [callback] : [...this._deferred, callback]
    }
  },
  middlewares(middlewares, clear = false) {
    return {
      ...this,
      _middlewares: clear ? middlewares : [...this._middlewares, ...middlewares]
    }
  },
  fetch(method: string = this._options.method, url = "", body = null) {
    let base = this.url(url).options({ method })
    // "Jsonify" the body if it is an object and if it is likely that the content type targets json.
    const contentType = extractContentType(base._options.headers)
    const jsonify = typeof body === "object" && (!base._options.headers || !contentType || isLikelyJsonMime(contentType))
    base =
      !body ? base :
        jsonify ? base.json(body, contentType) :
          base.body(body)
    return resolver(
      base
        ._deferred
        .reduce((acc: Wretch, curr) => curr(acc, acc._url, acc._options), base)
    )
  },
  get(url = "") {
    return this.fetch("GET", url)
  },
  delete(url = "") {
    return this.fetch("DELETE", url)
  },
  put(body, url = "") {
    return this.fetch("PUT", url, body)
  },
  post(body, url = "") {
    return this.fetch("POST", url, body)
  },
  patch(body, url = "") {
    return this.fetch("PATCH", url, body)
  },
  head(url = "") {
    return this.fetch("HEAD", url)
  },
  opts(url = "") {
    return this.fetch("OPTIONS", url)
  },
  body(contents) {
    return { ...this, _options: { ...this._options, body: contents } }
  },
  json(jsObject, contentType) {
    const currentContentType = extractContentType(this._options.headers)
    return this.content(
      contentType ||
      isLikelyJsonMime(currentContentType) && currentContentType ||
      JSON_MIME
    ).body(JSON.stringify(jsObject))
  }
}
