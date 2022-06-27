import { mix, extractContentType, isLikelyJsonMime } from "./utils"
import * as Constants from "./constants"
import { resolver } from "./resolver"
import config from "./config"
import type { Config } from "./config"
import type { WretchError, WretchOptions, WretchDeferredCallback, WretchAddon } from "./types"
import type { WretchResponseChain } from "./resolver"
import type { ConfiguredMiddleware } from "./middleware"

/**
 * The Wretch object used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretch object.
 */
export interface Wretch<Self = unknown, Chain = unknown> {
  _url: string,
  _options: WretchOptions,
  _config: Config,
  _catchers: Map<number | string, (error: WretchError, originalRequest: Wretch<Self>) => void>
  _resolvers: ((resolver: Chain & WretchResponseChain<Self, Chain>, originalRequest: Wretch<Self>) => any)[]
  _deferredChain: WretchDeferredCallback<Self, Chain>[]
  _middlewares: ConfiguredMiddleware[]
  _addons: WretchAddon<unknown, Chain>[]

  /**
   * @private
   */
  clone(args: Record<string, any>): this

  /**
   * Register an Addon to enhance the wretch or response objects.
   */
  addon: <W, R>(addon: WretchAddon<W, R>) => W & Self & Wretch<Self & W, Chain & R>

  /**
   * Sets the default fetch options used for every subsequent fetch call.
   * @param options - New default options
   * @param replace - If true, replaces the existing options instead of mixing in
   */
  defaults(this: Self & Wretch<Self, Chain>, options: WretchOptions, replace?: boolean): this

  /**
   * Sets the method (text, json ...) used to parse the data contained in the response body in case of an HTTP error.
   *
   * Persists for every subsequent requests.
   *
   * Default is "text".
   */
  errorType(this: Self & Wretch<Self, Chain>, method: string): this

  /**
   * Sets the non-global polyfills which will be used for every subsequent calls.
   *
   * Needed for libraries like [fetch-ponyfill](https://github.com/qubyte/fetch-ponyfill).
   *
   * @param polyfills - An object containing the polyfills
   * @param replace - If true, replaces the current polyfills instead of mixing in
   */
  polyfills(this: Self & Wretch<Self, Chain>, polyfills: Partial<typeof config.polyfills>): this

  /**
   * Returns a new Wretch object with the argument url appended and the same options.
   * @param url - Url segment
   * @param replace - If true, replaces the current url instead of appending
   */
  url(this: Self & Wretch<Self, Chain>, url: string, replace?: boolean): this

  /**
   * Returns a new Wretch object with the same url and new options.
   * @param options - New options
   * @param mixin - If true, mixes in instead of replacing the existing options
   */
  options(this: Self & Wretch<Self, Chain>, options: WretchOptions, mixin?: boolean): this

  /**
   * Set request headers.
   * @param headerValues - An object containing header keys and values
   */
  headers(this: Self & Wretch<Self, Chain>, headerValues: HeadersInit): this

  /**
   * Shortcut to set the "Accept" header.
   * @param headerValue - Header value
   */
  accept(this: Self & Wretch<Self, Chain>, headerValue: string): this

  /**
   * Shortcut to set the "Content-Type" header.
   * @param headerValue - Header value
   */
  content(this: Self & Wretch<Self, Chain>, headerValue: string): this

  /**
   * Shortcut to set the "Authorization" header.
   * @param headerValue - Header value
   */
  auth(this: Self & Wretch<Self, Chain>, headerValue: string): this

  /**
   * Adds a default catcher which will be called on every subsequent request error when the error code matches.
   * @param errorId - Error code or name
   * @param catcher - The catcher method
   */
  catcher(this: Self & Wretch<Self, Chain>, errorId: number | string, catcher: (error: WretchError, originalRequest: Wretch<Self>) => any): this

  /**
   * Defer wretch methods that will be chained and called just before the request is performed.
   */
  defer(this: Self & Wretch<Self, Chain>, callback: WretchDeferredCallback<Self, Chain>, clear?: boolean): this

  /**
   * Program a resolver to perform response chain tasks automatically.
   * @param resolver - Resolver callback
   */
  resolve(this: Self & Wretch<Self, Chain>, resolver: (chain: Chain & WretchResponseChain<Self, Chain>, originalRequest: Wretch<Self>) => WretchResponseChain<Self, Chain> | Promise<any>, clear?: boolean): this

  /**
   * Add middlewares to intercept a request before being sent.
   */
  middlewares(this: Self & Wretch<Self, Chain>, middlewares: ConfiguredMiddleware[], clear?: boolean): this

  method(this: Self & Wretch<Self, Chain>, method: string, options?: any, body?: any): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a get request.
   */
  get(this: Self & Wretch<Self, Chain>, options?: WretchOptions): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a delete request.
   */
  delete(this: Self & Wretch<Self, Chain>, options?: WretchOptions): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a put request.
   */
  put(this: Self & Wretch<Self, Chain>, body?: any, options?: WretchOptions): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a post request.
   */
  post(this: Self & Wretch<Self, Chain>, body?: any, options?: WretchOptions): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a patch request.
   */
  patch(this: Self & Wretch<Self, Chain>, body?: any, options?: WretchOptions): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a head request.
   */
  head(this: Self & Wretch<Self, Chain>, options?: WretchOptions): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs an options request
   */
  opts(this: Self & Wretch<Self, Chain>, options?: WretchOptions): Chain & WretchResponseChain<Self, Chain>
  /**
   * Replay a request.
   */
  replay(this: Self & Wretch<Self, Chain>, options?: WretchOptions): Chain & WretchResponseChain<Self, Chain>

  /**
   * Sets the request body with any content.
   * @param contents - The body contents
   */
  body(this: Self & Wretch<Self, Chain>, contents: any): this

  /**
   * Sets the content type header, stringifies an object and sets the request body.
   * @param jsObject - An object which will be serialized into a JSON
   * @param contentType - A custom content type.
   */
  json(this: Self & Wretch<Self, Chain>, jsObject: object, contentType?: string): this
}

export const core: Wretch = {
  _url: "",
  _options: {},
  _config: config,
  _catchers: new Map(),
  _resolvers: [],
  _deferredChain: [],
  _middlewares: [],
  _addons: [],
  clone({
    url = this._url,
    options = this._options,
    config = this._config,
    catchers = this._catchers,
    resolvers = this._resolvers,
    deferredChain = this._deferredChain,
    middlewares = this._middlewares,
    addons = this._addons
  } = {}) {
    return {
      ...this,
      _url: url,
      _options: { ...options },
      _catchers: new Map(catchers),
      _config: { ...config },
      _resolvers: [...resolvers],
      _deferredChain: [...deferredChain],
      _middlewares: [...middlewares],
      _addons: [...addons]
    }
  },

  addon(addon) {
    return {
      ...this.clone({ addons: [...this._addons, addon] }),
      ...addon.wretch
    }
  },

  defaults(options, replace = false) {
    return this.clone({
      config: {
        ...this._config,
        defaults: replace ? options : mix(this._config.defaults, options)
      }
    })
  },

  errorType(errorType: string) {
    return this.clone({ errorType })
  },

  polyfills(polyfills, replace = false) {
    return this.clone({
      config: {
        ...this._config,
        polyfills: replace ? polyfills : mix(this._config.polyfills, polyfills)
      }
    })
  },

  url(url, replace = false) {
    if (replace)
      return this.clone({ url })
    const split = this._url.split("?")
    return this.clone({
      url: split.length > 1 ?
        split[0] + url + "?" + split[1] :
        this._url + url
    })
  },
  options(options, mixin = true) {
    return this.clone({ options: mixin ? mix(this._options, options) : options })
  },
  headers(headerValues) {
    return this.clone({ options: mix(this._options, { headers: headerValues || {} }) })
  },
  accept(headerValue) {
    return this.headers({ Accept: headerValue })
  },
  content(headerValue) {
    return this.headers({ [Constants.CONTENT_TYPE_HEADER]: headerValue })
  },
  auth(headerValue) {
    return this.headers({ Authorization: headerValue })
  },
  catcher(errorId, catcher) {
    const newMap = new Map(this._catchers)
    newMap.set(errorId, catcher)
    return this.clone({ catchers: newMap })
  },
  resolve(resolver, clear: boolean = false) {
    return this.clone({ resolvers: clear ? [resolver] : [...this._resolvers, resolver] })
  },
  defer(callback, clear = false) {
    return this.clone({
      deferredChain: clear ? [callback] : [...this._deferredChain, callback]
    })
  },
  middlewares(middlewares, clear = false) {
    return this.clone({
      middlewares: clear ? middlewares : [...this._middlewares, ...middlewares]
    })
  },
  method(method: string, options = {}, body = null) {
    let base = this.options({ ...options, method })
    // "Jsonify" the body if it is an object and if it is likely that the content type targets json.
    const contentType = extractContentType(base._options.headers)
    const jsonify = typeof body === "object" && (!base._options.headers || !contentType || isLikelyJsonMime(contentType))
    base =
      !body ? base :
        jsonify ? base.json(body, contentType) :
          base.body(body)
    return resolver(
      base
        ._deferredChain
        .reduce((acc: Wretch, curr) => curr(acc, acc._url, acc._options), base)
    )
  },
  get(options) {
    return this.method("GET", options)
  },
  delete(options) {
    return this.method("DELETE", options)
  },
  put(body, options) {
    return this.method("PUT", options, body)
  },
  post(body, options) {
    return this.method("POST", options, body)
  },
  patch(body, options) {
    return this.method("PATCH", options, body)
  },
  head(options) {
    return this.method("HEAD", options)
  },
  opts(options) {
    return this.method("OPTIONS", options)
  },
  replay(options) {
    return this.method(this._options.method, options)
  },
  body(contents) {
    return this.clone({ options: { ...this._options, body: contents } })
  },
  json(jsObject, contentType) {
    const currentContentType = extractContentType(this._options.headers)
    return this.content(
      contentType ||
      isLikelyJsonMime(currentContentType) && currentContentType ||
      Constants.JSON_MIME
    ).body(JSON.stringify(jsObject))
  }
}