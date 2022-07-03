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
 * Immutability : almost every method of this class return a fresh Wretch object.
 */
export interface Wretch<Self = unknown, Chain = unknown> {
  /**
   * @private
   */
  _url: string,
  /**
   * @private
   */
  _options: WretchOptions,
  /**
   * @private
   */
  _config: Config,
  /**
   * @private
   */
  _catchers: Map<number | string | symbol, (error: WretchError, originalRequest: Wretch<Self>) => void>
  /**
   * @private
   */
  _resolvers: ((resolver: Chain & WretchResponseChain<Self, Chain>, originalRequest: Wretch<Self>) => any)[]
  /**
   * @private
   */
  _deferred: WretchDeferredCallback<Self, Chain>[]
  /**
   * @private
   */
  _middlewares: ConfiguredMiddleware[]
  /**
   * @private
   */
  _addons: WretchAddon<unknown, Chain>[]

  /**
   * Register an Addon to enhance the wretch or response objects.
   */
  addon: <W, R>(addon: WretchAddon<W, R>) => W & Self & Wretch<Self & W, Chain & R>

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
   * @param replace - If true, replaces the existing options
   */
  options(this: Self & Wretch<Self, Chain>, options: WretchOptions, replace?: boolean): this

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

  /**
   * Sends the request using the accumulated fetch options.
   */
  fetch(this: Self & Wretch<Self, Chain>, method?: string, url?: string, body?: any): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a get request.
   */
  get(this: Self & Wretch<Self, Chain>, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a delete request.
   */
  delete(this: Self & Wretch<Self, Chain>, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a put request.
   */
  put(this: Self & Wretch<Self, Chain>, body?: any, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a post request.
   */
  post(this: Self & Wretch<Self, Chain>, body?: any, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a patch request.
   */
  patch(this: Self & Wretch<Self, Chain>, body?: any, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs a head request.
   */
  head(this: Self & Wretch<Self, Chain>, url?: string): Chain & WretchResponseChain<Self, Chain>
  /**
   * Performs an options request
   */
  opts(this: Self & Wretch<Self, Chain>, url?: string): Chain & WretchResponseChain<Self, Chain>

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