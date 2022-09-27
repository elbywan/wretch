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
export interface Wretch<Self = unknown, Chain = unknown, Resolver = undefined> {
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
  _catchers: Map<number | string | symbol, (error: WretchError, originalRequest: Wretch<Self, Chain, Resolver>) => void>
  /**
   * @private @internal
   */
  _resolvers: ((resolver: Resolver extends undefined ? Chain & WretchResponseChain<Self, Chain> : Resolver, originalRequest: Wretch<Self, Chain, Resolver>) => any)[]
  /**
   * @private @internal
   */
  _deferred: WretchDeferredCallback<Self, Chain, Resolver>[]
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
  addon<W, R>(addon: WretchAddon<W, R>): W & Self & Wretch<Self & W, Chain & R, Resolver>

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
  errorType(this: Self & Wretch<Self, Chain, Resolver>, method: string): this

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
  polyfills(this: Self & Wretch<Self, Chain, Resolver>, polyfills: Partial<Config["polyfills"]>, replace?: boolean): this

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
  url(this: Self & Wretch<Self, Chain, Resolver>, url: string, replace?: boolean): this

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
  options(this: Self & Wretch<Self, Chain, Resolver>, options: WretchOptions, replace?: boolean): this

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
  headers(this: Self & Wretch<Self, Chain, Resolver>, headerValues: HeadersInit): this

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
  accept(this: Self & Wretch<Self, Chain, Resolver>, headerValue: string): this

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
  content(this: Self & Wretch<Self, Chain, Resolver>, headerValue: string): this

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
  auth(this: Self & Wretch<Self, Chain, Resolver>, headerValue: string): this

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
  catcher(this: Self & Wretch<Self, Chain, Resolver>, errorId: number | string, catcher: (error: WretchError, originalRequest: Wretch<Self, Chain, Resolver>) => any): this

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
  defer<Clear extends boolean = false>(
    this: Self & Wretch<Self, Chain, Resolver>,
    callback: WretchDeferredCallback<Self, Chain, Resolver>,
    clear?: Clear
  ): this

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
  resolve<ResolverReturn, Clear extends boolean = false>(
    this: Self & Wretch<Self, Chain, Resolver>,
    resolver: (
      chain:
        Resolver extends undefined ?
        Chain & WretchResponseChain<Self, Chain, undefined> :
        Clear extends true ?
        Chain & WretchResponseChain<Self, Chain, undefined> :
        Resolver,
      originalRequest: Wretch<Self, Chain, Clear extends true ? undefined : Resolver>
    ) => ResolverReturn,
    clear?: Clear
  ): Self & Wretch<Self, Chain, ResolverReturn>

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
  middlewares(this: Self & Wretch<Self, Chain, Resolver>, middlewares: ConfiguredMiddleware[], clear?: boolean): this

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
  body(this: Self & Wretch<Self, Chain, Resolver>, contents: any): this

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
  json(this: Self & Wretch<Self, Chain, Resolver>, jsObject: object, contentType?: string): this


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
  fetch(this: Self & Wretch<Self, Chain, Resolver>, method?: string, url?: string, body?: any):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver> :
    Resolver
  /**
   * Performs a [GET](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET) request.
   *
   * ```js
   * wretch("...").get();
   * ```
   *
   * @category HTTP
   */
  get(this: Self & Wretch<Self, Chain, Resolver>, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver> :
    Resolver
  /**
   * Performs a [DELETE](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE) request.
   *
   * ```js
   * wretch("...").delete();
   * ```
   *
   * @category HTTP
   */
  delete(this: Self & Wretch<Self, Chain, Resolver>, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver> :
    Resolver
  /**
   * Performs a [PUT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT) request.
   *
   * ```js
   * wretch("...").json({...}).put()
   * ```
   *
   * @category HTTP
   */
  put(this: Self & Wretch<Self, Chain, Resolver>, body?: any, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver> :
    Resolver
  /**
   * Performs a [POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) request.
   *
   * ```js
   * wretch("...").json({...}).post()
   * ```
   *
   * @category HTTP
   */
  post(this: Self & Wretch<Self, Chain, Resolver>, body?: any, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver> :
    Resolver
  /**
   * Performs a [PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH) request.
   *
   * ```js
   * wretch("...").json({...}).patch()
   * ```
   *
   * @category HTTP
   */
  patch(this: Self & Wretch<Self, Chain, Resolver>, body?: any, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver> :
    Resolver
  /**
   * Performs a [HEAD](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD) request.
   *
   * ```js
   * wretch("...").head();
   * ```
   *
   * @category HTTP
   */
  head(this: Self & Wretch<Self, Chain, Resolver>, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver> :
    Resolver
  /**
   * Performs an [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS) request.
   *
   * ```js
   * wretch("...").opts();
   * ```
   *
   * @category HTTP
   */
  opts(this: Self & Wretch<Self, Chain, Resolver>, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver> :
    Resolver
}

/**
 * The resolver interface to chaining catchers and extra methods after the request has been sent.
 * Ultimately returns a Promise.
 *
 */
export interface WretchResponseChain<T, Self = unknown, R = undefined> {
  /**
   * @private @internal
   */
  _wretchReq: Wretch<T, Self, R>,
  /**
   * @private @internal
   */
  _fetchReq: Promise<WretchResponse>,

  /**
   *
   * The handler for the raw fetch Response.
   * Check the [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Response) documentation for more details on the Response class.
   *
   * ```js
   * wretch("...").get().res((response) => console.log(response.url));
   * ```
   *
   * @category Response Type
   */
  res: <Result = WretchResponse>(cb?: (type: WretchResponse) => Promise<Result> | Result) => Promise<Awaited<Result>>,
  /**
   * Read the payload and deserialize it as JSON.
   *
   * ```js
   * wretch("...").get().json((json) => console.log(Object.keys(json)));
   * ```
   *
   * @category Response Type
   */
  json: <Result = unknown>(cb?: (type: any) => Promise<Result> | Result) => Promise<Awaited<Result>>,
  /**
   * Read the payload and deserialize it as a Blob.
   *
   * ```js
   * wretch("...").get().blob(blob => …)
   * ```
   *
   * @category Response Type
   */
  blob: <Result = Blob>(cb?: (type: Blob) => Promise<Result> | Result) => Promise<Awaited<Result>>,
  /**
   * Read the payload and deserialize it as a FormData object.
   *
   * ```js
   * wretch("...").get().formData(formData => …)
   * ```
   *
   * @category Response Type
   */
  formData: <Result = FormData>(cb?: (type: FormData) => Promise<Result> | Result) => Promise<Awaited<Result>>,
  /**
   * Read the payload and deserialize it as an ArrayBuffer object.
   *
   * ```js
   * wretch("...").get().arrayBuffer(arrayBuffer => …)
   * ```
   *
   * @category Response Type
   */
  arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Promise<Result> | Result) => Promise<Awaited<Result>>,
  /**
   * Retrieves the payload as a string.
   *
   * ```js
   * wretch("...").get().text((txt) => console.log(txt));
   * ```
   *
   * @category Response Type
   */
  text: <Result = string>(cb?: (type: string) => Promise<Result> | Result) => Promise<Awaited<Result>>,

  /**
   * Catches an http response with a specific error code or name and performs a callback.
   *
   * The original request is passed along the error and can be used in order to
   * perform an additional request.
   *
   * ```js
   * wretch("/resource")
   *   .get()
   *   .unauthorized(async (error, req) => {
   *     // Renew credentials
   *     const token = await wretch("/renewtoken").get().text();
   *     storeToken(token);
   *     // Replay the original request with new credentials
   *     return req.auth(token).get().unauthorized((err) => {
   *       throw err;
   *     }).json();
   *   })
   *   .json()
   *   // The promise chain is preserved as expected
   *   // ".then" will be performed on the result of the original request
   *   // or the replayed one (if a 401 error was thrown)
   *   .then(callback);
   * ```
   *
   * @category Catchers
   */
  error: (this: Self & WretchResponseChain<T, Self, R>, code: (number | string | symbol), cb: WretchErrorCallback<T, Self, R>) => this,
  /**
   * Catches a bad request (http code 400) and performs a callback.
   *
   * _Syntactic sugar for `error(400, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  badRequest: (this: Self & WretchResponseChain<T, Self, R>, cb: WretchErrorCallback<T, Self, R>) => this,
  /**
   * Catches an unauthorized request (http code 401) and performs a callback.
   *
   * _Syntactic sugar for `error(401, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  unauthorized: (this: Self & WretchResponseChain<T, Self, R>, cb: WretchErrorCallback<T, Self, R>) => this,
  /**
   * Catches a forbidden request (http code 403) and performs a callback.
   *
   * _Syntactic sugar for `error(403, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  forbidden: (this: Self & WretchResponseChain<T, Self, R>, cb: WretchErrorCallback<T, Self, R>) => this,
  /**
   * Catches a "not found" request (http code 404) and performs a callback.
   *
   * _Syntactic sugar for `error(404, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  notFound: (this: Self & WretchResponseChain<T, Self, R>, cb: WretchErrorCallback<T, Self, R>) => this,
  /**
   * Catches a timeout (http code 408) and performs a callback.
   *
   *
   * _Syntactic sugar for `error(408, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  timeout: (this: Self & WretchResponseChain<T, Self, R>, cb: WretchErrorCallback<T, Self, R>) => this,
  /**
   * Catches an internal server error (http code 500) and performs a callback.
   *
   *
   * _Syntactic sugar for `error(500, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  internalError: (this: Self & WretchResponseChain<T, Self, R>, cb: WretchErrorCallback<T, Self, R>) => this,
  /**
   * Catches any error thrown by the fetch function and perform the callback.
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  fetchError: (this: Self & WretchResponseChain<T, Self, R>, cb: WretchErrorCallback<T, Self, R>) => this,
}

/**
 * Configuration object.
 */
export type Config = {
  options: {};
  errorType: string;
  polyfills: {};
  polyfill(p: string, doThrow?: boolean, instance?: boolean, ...args: any[]): any;
}

/**
 * Fetch Request options with additional properties.
 */
export type WretchOptions = Record<string, any>
/**
 * An Error enhanced with status, text and body.
 */
export interface WretchError extends Error { status: number, response: WretchResponse, text?: string, json?: any }
/**
 * Callback provided to catchers on error. Contains the original wretch instance used to perform the request.
 */
export type WretchErrorCallback<T, C, R> = (error: WretchError, originalRequest: Wretch<T, C, R>) => any
/**
 * Fetch Response object with additional properties.
 */
export type WretchResponse = Response & { [key: string]: any }
/**
 * Callback provided to the defer function allowing to chain deferred actions that will be stored and applied just before the request is sent.
 */
export type WretchDeferredCallback<T, C, R> = (wretch: T & Wretch<T, C, R>, url: string, options: WretchOptions) => Wretch<T, C, R>

/**
 * Shape of a typical middleware.
 * Expects options and returns a ConfiguredMiddleware that can then be registered using the .middlewares function.
 */
export type Middleware = (options?: { [key: string]: any }) => ConfiguredMiddleware
/**
 * A ready to use middleware which is called before the request is sent.
 * Input is the next middleware in the chain, then url and options.
 * Output is a promise.
 */
export type ConfiguredMiddleware = (next: FetchLike) => FetchLike
/**
 * Any function having the same shape as fetch().
 */
export type FetchLike = (url: string, opts: WretchOptions) => Promise<WretchResponse>

/**
 * An addon enhancing either the request or response chain (or both).
 */
export type WretchAddon<W extends unknown, R extends unknown = unknown> = {
  beforeRequest?<T, C, R>(wretch: Wretch<T, C, R>, options: WretchOptions): void,
  wretch?: W,
  resolver?: R
}

