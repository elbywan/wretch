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
export interface Wretch<Self = unknown, Chain = unknown, Resolver = undefined, ErrorType = undefined> {
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
  _fetch?: FetchLike | ((url: string, opts: WretchOptions) => Promise<Response>),
  /**
   * @private @internal
   */
  _errorTransformer?: <T>(error: WretchError, response: WretchResponse, request: Wretch<any, any, any, any>) => Promise<T> | T,
  /**
   * @private @internal
   */
  _catchers: Map<number | string | symbol, (error: ErrorType extends undefined ? WretchError : ErrorType, originalRequest: Wretch<Self, Chain, Resolver, ErrorType>) => void>
  /**
   * @private @internal
   */
  _resolvers: ((resolver: Resolver extends undefined ? Chain & WretchResponseChain<Self, Chain> : Resolver, originalRequest: Wretch<Self, Chain, Resolver, ErrorType>) => any)[]
  /**
   * @private @internal
   */
  _deferred: WretchDeferredCallback<Self, Chain, Resolver, ErrorType>[]
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
   * // Add a single addon
   * const w = wretch().addon(FormDataAddon)
   *
   * // Or add multiple addons at once
   * const w2 = wretch().addon([FormDataAddon, QueryStringAddon])
   *
   * // Additional features are now available
   * w.formData({ hello: "world" }).query({ check: true })
   * ```
   *
   * @category Helpers
   * @param addon - A Wretch addon or an array of addons to register
   */
  addon<W, R>(addon: WretchAddon<W, R>): W & Self & Wretch<Self & W, Chain & R, Resolver, ErrorType>
  addon<W1, R1, W2, R2>(addon: [WretchAddon<W1, R1>, WretchAddon<W2, R2>]): W1 & W2 & Self & Wretch<Self & W1 & W2, Chain & R1 & R2, Resolver, ErrorType>
  addon<W1, R1, W2, R2, W3, R3>(addon: [WretchAddon<W1, R1>, WretchAddon<W2, R2>, WretchAddon<W3, R3>]): W1 & W2 & W3 & Self & Wretch<Self & W1 & W2 & W3, Chain & R1 & R2 & R3, Resolver, ErrorType>
  addon<W1, R1, W2, R2, W3, R3, W4, R4>(addon: [WretchAddon<W1, R1>, WretchAddon<W2, R2>, WretchAddon<W3, R3>, WretchAddon<W4, R4>]): W1 & W2 & W3 & W4 & Self & Wretch<Self & W1 & W2 & W3 & W4, Chain & R1 & R2 & R3 & R4, Resolver, ErrorType>
  addon<W1, R1, W2, R2, W3, R3, W4, R4, W5, R5>(addon: [WretchAddon<W1, R1>, WretchAddon<W2, R2>, WretchAddon<W3, R3>, WretchAddon<W4, R4>, WretchAddon<W5, R5>]): W1 & W2 & W3 & W4 & W5 & Self & Wretch<Self & W1 & W2 & W3 & W4 & W5, Chain & R1 & R2 & R3 & R4 & R5, Resolver, ErrorType>
  addon<W1, R1, W2, R2, W3, R3, W4, R4, W5, R5, W6, R6>(addon: [WretchAddon<W1, R1>, WretchAddon<W2, R2>, WretchAddon<W3, R3>, WretchAddon<W4, R4>, WretchAddon<W5, R5>, WretchAddon<W6, R6>]): W1 & W2 & W3 & W4 & W5 & W6 & Self & Wretch<Self & W1 & W2 & W3 & W4 & W5 & W6, Chain & R1 & R2 & R3 & R4 & R5 & R6, Resolver, ErrorType>
  addon<W1, R1, W2, R2, W3, R3, W4, R4, W5, R5, W6, R6, W7, R7>(addon: [WretchAddon<W1, R1>, WretchAddon<W2, R2>, WretchAddon<W3, R3>, WretchAddon<W4, R4>, WretchAddon<W5, R5>, WretchAddon<W6, R6>, WretchAddon<W7, R7>]): W1 & W2 & W3 & W4 & W5 & W6 & W7 & Self & Wretch<Self & W1 & W2 & W3 & W4 & W5 & W6 & W7, Chain & R1 & R2 & R3 & R4 & R5 & R6 & R7, Resolver, ErrorType>
  addon<W1, R1, W2, R2, W3, R3, W4, R4, W5, R5, W6, R6, W7, R7, W8, R8>(addon: [WretchAddon<W1, R1>, WretchAddon<W2, R2>, WretchAddon<W3, R3>, WretchAddon<W4, R4>, WretchAddon<W5, R5>, WretchAddon<W6, R6>, WretchAddon<W7, R7>, WretchAddon<W8, R8>]): W1 & W2 & W3 & W4 & W5 & W6 & W7 & W8 & Self & Wretch<Self & W1 & W2 & W3 & W4 & W5 & W6 & W7 & W8, Chain & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8, Resolver, ErrorType>
  addon<W1, R1, W2, R2, W3, R3, W4, R4, W5, R5, W6, R6, W7, R7, W8, R8, W9, R9>(addon: [WretchAddon<W1, R1>, WretchAddon<W2, R2>, WretchAddon<W3, R3>, WretchAddon<W4, R4>, WretchAddon<W5, R5>, WretchAddon<W6, R6>, WretchAddon<W7, R7>, WretchAddon<W8, R8>, WretchAddon<W9, R9>]): W1 & W2 & W3 & W4 & W5 & W6 & W7 & W8 & W9 & Self & Wretch<Self & W1 & W2 & W3 & W4 & W5 & W6 & W7 & W8 & W9, Chain & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9, Resolver, ErrorType>

  /**
   * Sets a custom fetch implementation to use for requests.
   *
   * This is useful for:
   * - Adding custom middleware to fetch
   * - Using alternative fetch implementations
   * - Mocking fetch in tests
   * - Adding performance monitoring
   *
   * ```js
   * // Add performance monitoring to fetch
   * const customFetch = (url, opts) => {
   *   console.time(url)
   *   return fetch(url, opts).finally(() => console.timeEnd(url))
   * }
   *
   * wretch("http://domain.com")
   *   .fetchPolyfill(customFetch)
   *   .get()
   * ```
   *
   * @category Helpers
   * @param fetch - A custom fetch implementation
   */
  fetchPolyfill(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, fetch: (url: string, opts: WretchOptions) => Promise<Response>): this

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
  url(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, url: string, replace?: boolean): this

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
  options(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, options: WretchOptions, replace?: boolean): this

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
  headers(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, headerValues: HeadersInit): this

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
  accept(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, headerValue: string): this

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
  content(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, headerValue: string): this

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
  auth(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, headerValue: string): this

  /**
   * Adds a [catcher](https://github.com/elbywan/wretch#catchers) which will be
   * called on every subsequent request error.
   *
   * Very useful when you need to perform a repetitive action on a specific error
   * code or multiple error codes.
   *
   * ```js
   * const w = wretch()
   *   .catcher(404, err => redirect("/routes/notfound", err.message))
   *   .catcher(500, err => flashMessage("internal.server.error"))
   *
   * // Catch multiple error codes with the same handler
   * const w2 = wretch()
   *   .catcher([401, 403], err => redirect("/login"))
   *
   * // No need to catch the 404, 500, 401, or 403 codes, they are already taken care of.
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
   * @param errorId - Error code or name, or an array of error codes/names
   * @param catcher - The catcher method
   */
  catcher(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, errorId: ErrorId | ErrorId[], catcher: (error: ErrorType extends undefined ? WretchError : ErrorType, originalRequest: this) => any): Wretch<Self, Chain, Resolver, ErrorType extends undefined ? WretchError : ErrorType>

  /**
   * A fallback catcher that will be called for any error thrown - if uncaught by other means.
   *
   * ```js
   * wretch(url)
   *   .catcher(404, err => redirect("/routes/notfound", err.message))
   *   .catcher(500, err => flashMessage("internal.server.error"))
   *   // this fallback will trigger for any error except the ones caught above (404 and 505)
   *   .catcherFallback(err => {
   *     log("Uncaught error:", err)
   *     throw err
   *   })
   * ```
   *
   * @category Helpers
   * @see {@link Wretch.catcher} for more details.
   * @param catcher - The catcher method
   */
  catcherFallback(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, catcher: (error: ErrorType extends undefined ? WretchError : ErrorType, originalRequest: this) => any): Wretch<Self, Chain, Resolver, ErrorType extends undefined ? WretchError : ErrorType>

  /**
   * Configures custom error parsing for all error responses.
   *
   * Allows you to transform errors and add custom properties that will be fully typed
   * across all error handlers (.error(), .badRequest(), .unauthorized(), etc.).
   *
   * ```js
   * interface ApiError {
   *   code: number;
   *   message: string;
   * }
   *
   * const api = wretch("https://api.example.com")
   *   .customError<ApiError>(async (error, response, request) => {
   *     const json = await response.json();
   *     return { ...error, ...json };
   *   });
   *
   * // All error handlers now have typed access to ApiError properties
   * api.get("/resource")
   *   .badRequest(error => {
   *     // error.code and error.message are fully typed as ApiError
   *     console.log(error.code, error.message);
   *   })
   *   .json();
   * ```
   *
   * @category Helpers
   * @param transformer - A function that receives the error, response, and request, and returns the transformed error with custom properties
   */
  customError<T extends (ErrorType extends undefined ? any : ErrorType)>(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, transformer: (error: WretchError, response: WretchResponse, request: Self & Wretch<Self, Chain, Resolver, ErrorType>) => Promise<T> | T): Self & Wretch<Self, Chain, Resolver, T>

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
    this: Self & Wretch<Self, Chain, Resolver, ErrorType>,
    callback: WretchDeferredCallback<Self, Chain, Resolver, ErrorType>,
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
    this: Self & Wretch<Self, Chain, Resolver, ErrorType>,
    resolver: (
      chain:
        Resolver extends undefined ?
        Chain & WretchResponseChain<Self, Chain, undefined, ErrorType> :
        Clear extends true ?
        Chain & WretchResponseChain<Self, Chain, undefined, ErrorType> :
        Resolver,
      originalRequest: Self & Wretch<Self, Chain, Clear extends true ? undefined : Resolver, ErrorType>
    ) => ResolverReturn,
    clear?: Clear
  ): Self & Wretch<Self, Chain, ResolverReturn, ErrorType>

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
  middlewares(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, middlewares: ConfiguredMiddleware[], clear?: boolean): this

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
  body(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, contents: any): this

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
  json(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, jsObject: object, contentType?: string): this


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
  fetch(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, method?: string, url?: string, body?: any):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver, ErrorType> :
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
  get(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver, ErrorType> :
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
  delete(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver, ErrorType> :
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
  put(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, body?: any, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver, ErrorType> :
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
  post(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, body?: any, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver, ErrorType> :
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
  patch(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, body?: any, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver, ErrorType> :
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
  head(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver, ErrorType> :
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
  opts(this: Self & Wretch<Self, Chain, Resolver, ErrorType>, url?: string):
    Resolver extends undefined ?
    Chain & WretchResponseChain<Self, Chain, Resolver, ErrorType> :
    Resolver

  /**
   * Converts the wretch instance into a fetch-like function that preserves all
   * accumulated configuration (middlewares, catchers, options, headers, etc.).
   *
   * Useful for integrating with libraries that expect a fetch function signature.
   *
   * ```js
   * const myFetch = wretch("https://api.example.com")
   *   .auth("Bearer token")
   *   .catcher(401, handleAuth)
   *   .middlewares([retry()])
   *   .toFetch()
   *
   * // Use like regular fetch but with all the wretch configuration
   * const response = await myFetch("/users", { method: "GET" })
   * ```
   *
   * @category Helpers
   */
  toFetch(this: Self & Wretch<Self, Chain, Resolver, ErrorType>): (url: string, options?: WretchOptions) => Promise<Response>
}

/**
 * The resolver interface to chaining catchers and extra methods after the request has been sent.
 * Ultimately returns a Promise.
 *
 */
export interface WretchResponseChain<T, Self = unknown, R = undefined, ErrorType = undefined> {
  /**
   * @private @internal
   */
  _wretchReq: Wretch<T, Self, R, ErrorType>,
  /**
   * @private @internal
   */
  _fetchReq: Promise<WretchResponse>,
  /**
   * @private @internal
   */
  _sharedState: Record<any, any>,

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
  error: (this: Self & WretchResponseChain<T, Self, R, ErrorType>, code: (number | string | symbol), cb: WretchErrorCallback<T, Self, R, ErrorType>) => this,
  /**
   * Catches a bad request (http code 400) and performs a callback.
   *
   * _Syntactic sugar for `error(400, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  badRequest: (this: Self & WretchResponseChain<T, Self, R, ErrorType>, cb: WretchErrorCallback<T, Self, R, ErrorType>) => this,
  /**
   * Catches an unauthorized request (http code 401) and performs a callback.
   *
   * _Syntactic sugar for `error(401, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  unauthorized: (this: Self & WretchResponseChain<T, Self, R, ErrorType>, cb: WretchErrorCallback<T, Self, R, ErrorType>) => this,
  /**
   * Catches a forbidden request (http code 403) and performs a callback.
   *
   * _Syntactic sugar for `error(403, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  forbidden: (this: Self & WretchResponseChain<T, Self, R, ErrorType>, cb: WretchErrorCallback<T, Self, R, ErrorType>) => this,
  /**
   * Catches a "not found" request (http code 404) and performs a callback.
   *
   * _Syntactic sugar for `error(404, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  notFound: (this: Self & WretchResponseChain<T, Self, R, ErrorType>, cb: WretchErrorCallback<T, Self, R, ErrorType>) => this,
  /**
   * Catches a timeout (http code 408) and performs a callback.
   *
   *
   * _Syntactic sugar for `error(408, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  timeout: (this: Self & WretchResponseChain<T, Self, R, ErrorType>, cb: WretchErrorCallback<T, Self, R, ErrorType>) => this,
  /**
   * Catches an internal server error (http code 500) and performs a callback.
   *
   *
   * _Syntactic sugar for `error(500, cb)`._
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  internalError: (this: Self & WretchResponseChain<T, Self, R, ErrorType>, cb: WretchErrorCallback<T, Self, R, ErrorType>) => this,
  /**
   * Catches any error thrown by the fetch function and perform the callback.
   *
   * @see {@link WretchResponseChain.error}
   * @category Catchers
   */
  fetchError: (this: Self & WretchResponseChain<T, Self, R, ErrorType>, cb: WretchErrorCallback<T, Self, R, ErrorType>) => this,
}



/**
 * Fetch Request options with additional properties.
 */
export type WretchOptions = Record<string, any> & RequestInit
/**
 * An Error enhanced with status, text and body.
 */
export type WretchError = Error & { status: number, response: WretchResponse, url: string }
/**
 * Callback provided to catchers on error. Contains the original wretch instance used to perform the request.
 */
export type WretchErrorCallback<T, C, R, E> = (error: E extends undefined ? WretchError : E, originalRequest: T & Wretch<T, C, R, E>) => any
/**
 * Fetch Response object with additional properties.
 */
export type WretchResponse = Response & { [key: string]: any }

/**
 * Any function having the same shape as fetch().
 */
export type FetchLike = (url: string, opts: WretchOptions) => Promise<WretchResponse>

/**
 * Callback provided to the defer function allowing to chain deferred actions that will be stored and applied just before the request is sent.
 */
export type WretchDeferredCallback<T, C, R, E> = (wretch: T & Wretch<T, C, R, E>, url: string, options: WretchOptions) => Wretch<T, C, any, E>

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
 * An addon enhancing either the request or response chain (or both).
 */
export type WretchAddon<W, R = unknown> = {
  beforeRequest?<T, C, R, E = unknown>(wretch: T & Wretch<T, C, R, E>, options: WretchOptions, state: Record<any, any>): T & Wretch<T, C, R, E>,
  wretch?: W,
  resolver?: R | (<T, C, E = unknown>(_: C & WretchResponseChain<T, C, R, E>) => R)
}

export type ErrorId = number | string | symbol