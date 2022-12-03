import { middlewareHelper } from "./middleware.js"
import { mix } from "./utils.js"
import type { Wretch, WretchResponse, WretchResponseChain, WretchError as WretchErrorType } from "./types.js"
import { FETCH_ERROR } from "./constants.js"

/**
 * This class inheriting from Error is thrown when the fetch response is not "ok".
 * It extends Error and adds status, text and body fields.
 */
export class WretchError extends Error implements WretchErrorType {
  status: number
  response: WretchResponse
  text?: string
  json?: any
}

export const resolver = <T, Chain, R>(wretch: T & Wretch<T, Chain, R>) => {
  const {
    _url: url,
    _options: opts,
    _config: config,
    _catchers: _catchers,
    _resolvers: resolvers,
    _middlewares: middlewares,
    _addons: addons
  } = wretch

  const catchers = new Map(_catchers)
  const finalOptions = mix(config.options, opts)
  addons.forEach(addon => addon.beforeRequest && addon.beforeRequest(wretch, finalOptions))
  // The generated fetch request
  const _fetchReq = middlewareHelper(middlewares)(config.polyfill("fetch"))(url, finalOptions)
  // Throws on an http error
  const referenceError = new Error()
  const throwingPromise: Promise<void | WretchResponse> = _fetchReq
    .catch(error => {
      throw { __wrap: error }
    })
    .then(response => {
      if (!response.ok) {
        const err = new WretchError()
        // Enhance the error object
        err["cause"] = referenceError
        err.stack = err.stack + "\nCAUSE: " + referenceError.stack
        err.response = response
        if (response.type === "opaque") {
          throw err
        }
        return response[config.errorType]().then((body: string) => {
          err.message = body
          err[config.errorType] = body
          err["status"] = response.status
          throw err
        })
      }
      return response
    })
  // Wraps the Promise in order to dispatch the error to a matching catcher
  const catchersWrapper = <T>(promise: Promise<T>): Promise<void | T> => {
    return promise.catch(err => {
      const error = err.__wrap || err

      const catcher =
        err.__wrap && catchers.has(FETCH_ERROR) ? catchers.get(FETCH_ERROR) :
          (catchers.get(error.status) || catchers.get(error.name))

      if (catcher)
        return catcher(error, wretch)

      throw error
    })
  }
  // Enforces the proper promise type when a body parsing method is called.
  type BodyParser = <Type>(funName: string | null) => <Result = void>(cb?: (type: Type) => Result) => Promise<Awaited<Result>>
  const bodyParser: BodyParser = funName => cb => funName ?
    // If a callback is provided, then callback with the body result otherwise return the parsed body itself.
    catchersWrapper(throwingPromise.then(_ => _ && _[funName]()).then(_ => cb ? cb(_) : _)) :
    // No body parsing method - return the response
    catchersWrapper(throwingPromise.then(_ => cb ? cb(_ as any) : _))

  const responseChain: WretchResponseChain<T, Chain, R> = {
    _wretchReq: wretch,
    _fetchReq,
    res: bodyParser<WretchResponse>(null),
    json: bodyParser<any>("json"),
    blob: bodyParser<Blob>("blob"),
    formData: bodyParser<FormData>("formData"),
    arrayBuffer: bodyParser<ArrayBuffer>("arrayBuffer"),
    text: bodyParser<string>("text"),
    error(errorId, cb) {
      catchers.set(errorId, cb)
      return this
    },
    badRequest(cb) { return this.error(400, cb) },
    unauthorized(cb) { return this.error(401, cb) },
    forbidden(cb) { return this.error(403, cb) },
    notFound(cb) { return this.error(404, cb) },
    timeout(cb) { return this.error(408, cb) },
    internalError(cb) { return this.error(500, cb) },
    fetchError(cb) { return this.error(FETCH_ERROR, cb) },
  }

  const enhancedResponseChain: R extends undefined ? Chain & WretchResponseChain<T, Chain, undefined> : R = addons.reduce((chain, addon) => ({
    ...chain,
    ...(addon.resolver as any)
  }), responseChain)

  return resolvers.reduce((chain, r) => r(chain, wretch), enhancedResponseChain)
}
