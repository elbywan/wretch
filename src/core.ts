import { mix, extractContentType, isLikelyJsonMime } from "./utils.js"
import { JSON_MIME, CONTENT_TYPE_HEADER } from "./constants.js"
import { resolver } from "./resolver.js"
import config from "./config.js"
import type { Wretch } from "./types.js"

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
  resolve<R = unknown>(resolver, clear: boolean = false) {
    return { ...this, _resolvers: clear ? [resolver] : [...this._resolvers, resolver] }
  },
  defer(callback, clear: boolean = false) {
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
