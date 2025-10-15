import { middlewareHelper } from "./middleware.js"
import type { Wretch, WretchResponse, WretchResponseChain, WretchError as WretchErrorType } from "./types.js"
import { CATCHER_FALLBACK, FETCH_ERROR } from "./constants.js"

/**
 * This class inheriting from Error is thrown when the fetch response is not "ok".
 * It extends Error and adds status, text and body fields.
 */
export class WretchError extends Error implements WretchErrorType {
  status: number
  response: WretchResponse
  url: string
}

export const resolver = <T, Chain, R, E>(wretch: T & Wretch<T, Chain, R, E>) => {
  const sharedState = Object.create(null)

  wretch = wretch._addons.reduce((w, addon) =>
    addon.beforeRequest &&
    addon.beforeRequest(w, wretch._options, sharedState)
    || w,
  wretch)

  const {
    _url: url,
    _options: opts,
    _fetch: customFetch,
    _errorTransformer: errorTransformer,
    _catchers: _catchers,
    _resolvers: resolvers,
    _middlewares: middlewares,
    _addons: addons
  } = wretch

  const catchers = new Map(_catchers)
  const finalOptions = opts

  // The generated fetch request
  let finalUrl = url
  const _fetchReq = middlewareHelper(middlewares)((url, options) => {
    finalUrl = url
    const fetchImpl = customFetch || fetch
    return fetchImpl(url, options)
  })(url, finalOptions)
  // Throws on an http error
  const referenceError = new Error()
  const throwingPromise: Promise<void | WretchResponse> = _fetchReq
    .then(async response => {
      if (!response.ok) {
        const err = new WretchError()
        err["cause"] = referenceError
        err.stack += "\nCAUSE: " + referenceError.stack
        err.response = response
        err.status = response.status
        err.url = finalUrl

        if (response.type === "opaque" || errorTransformer) {
          err.message = response.statusText
        } else {
          try {
            err.message = await response.text()
          } catch {
            err.message = response.statusText
          }
        }

        throw err
      }
      return response
    })
  // Wraps the Promise in order to dispatch the error to a matching catcher
  const catchersWrapper = <T>(promise: Promise<T>): Promise<void | T> =>
    promise.catch(async error => {

      const catcher =
        catchers.get(error?.status) ||
        catchers.get(error?.name) ||
        (!(error instanceof WretchError) && catchers.get(FETCH_ERROR)) ||
        catchers.get(CATCHER_FALLBACK)

      if(error.response && errorTransformer) {
        error = await errorTransformer(error, error.response)
      }

      if (catcher)
        return catcher(error, wretch)

      throw error
    })
  // Enforces the proper promise type when a body parsing method is called.
  type BodyParser =
    <Type>(funName: "json" | "blob" | "formData" | "arrayBuffer" | "text" | null)
    => <Result = void>(cb?: (type: Type) => Result)
    => Promise<Awaited<Result>>
  const bodyParser: BodyParser = funName => cb => {
    const promise = funName ?
    // If a callback is provided, then callback with the body result otherwise return the parsed body itself.
      throwingPromise.then(_ => _?.[funName]()) :
    // No body parsing method - return the response
      throwingPromise
    return catchersWrapper(cb ? promise.then(cb) : promise)
  }

  const responseChain: WretchResponseChain<T, Chain, R, E> = {
    _wretchReq: wretch,
    _fetchReq,
    _sharedState: sharedState,
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
    ...(typeof addon.resolver === "function" ? (addon.resolver as (_: WretchResponseChain<T, Chain, R, E>) => any)(chain) : addon.resolver)
  }), responseChain)

  return resolvers.reduce((chain, r) => r(chain, wretch), enhancedResponseChain)
}
