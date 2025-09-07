import { middlewareHelper } from "./middleware.js"
import { mix } from "./utils.js"
import type { Wretch, WretchResponse, WretchResponseChain, WretchError as WretchErrorType } from "./types.js"
import { FETCH_ERROR, CATCHER_FALLBACK } from "./constants.js"

/**
 * This class inheriting from Error is thrown when the fetch response is not "ok".
 * It extends Error and adds status, text and body fields.
 */
export class WretchError extends Error implements WretchErrorType {
  status: number
  response: WretchResponse
  url: string
  text?: string
  json?: any
  request?: Request
}

export const resolver = <T, Chain, R>(wretch: T & Wretch<T, Chain, R>) => {
  const sharedState = Object.create(null)

  wretch = wretch._addons.reduce((w, addon) =>
    addon.beforeRequest &&
    addon.beforeRequest(w, wretch._options, sharedState)
    || w,
  wretch)

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

  // The generated fetch request
  let finalUrl = url
  let finalRequest: Request | undefined
  const _fetchReq = middlewareHelper(middlewares)((url, options) => {
    finalUrl = url
    try {
      finalRequest = new Request(url, options)
    } catch {
      // Request creation failed (likely relative URL), we'll store basic info later
      finalRequest = undefined
    }
    return config.polyfill("fetch")(url, options)
  })(url, finalOptions)
  // Throws on an http error
  const referenceError = new Error()
  const throwingPromise: Promise<void | WretchResponse> = _fetchReq
    .catch(error => {
      throw { [FETCH_ERROR]: error }
    })
    .then(response => {
      if (!response.ok) {
        const err = new WretchError()
        // Enhance the error object
        err["cause"] = referenceError
        err.stack = err.stack + "\nCAUSE: " + referenceError.stack
        err.response = response
        err.status = response.status
        err.url = finalUrl
        if (finalRequest) {
          err.request = finalRequest
        }

        if (response.type === "opaque") {
          throw err
        }

        const jsonErrorType = config.errorType === "json" || response.headers.get("Content-Type")?.split(";")[0] === "application/json"
        const bodyPromise =
          !config.errorType ? Promise.resolve(response.body) :
            jsonErrorType ? response.text() :
              response[config.errorType]()

        return bodyPromise.then((body: unknown) => {
          err.message = typeof body === "string" ? body : response.statusText
          if(body) {
            if(jsonErrorType && typeof body === "string") {
              err.text = body
              try { 
                err.json = JSON.parse(body) 
              } catch (parseError) { 
                // JSON parsing failed, but we still want to throw the WretchError
                // The original text is preserved in err.text
              }
            } else {
              err[config.errorType] = body
            }
          }
          throw err
        }).catch(bodyError => {
          // If body parsing fails entirely, still throw the WretchError with basic info
          if (bodyError instanceof WretchError) {
            throw bodyError
          }
          err.message = response.statusText || "HTTP Error"
          throw err
        })
      }
      return response
    })
  // Wraps the Promise in order to dispatch the error to a matching catcher
  const catchersWrapper = <T>(promise: Promise<T>): Promise<void | T> => {
    return promise.catch(err => {
      const fetchErrorFlag = Object.prototype.hasOwnProperty.call(err, FETCH_ERROR)
      const error = fetchErrorFlag ? err[FETCH_ERROR] : err

      const catcher =
        (error?.status && catchers.get(error.status)) ||
        catchers.get(error?.name) || (
          fetchErrorFlag && catchers.has(FETCH_ERROR) && catchers.get(FETCH_ERROR)
        )

      if (catcher)
        return catcher(error, wretch)

      const catcherFallback = catchers.get(CATCHER_FALLBACK)
      if (catcherFallback)
        return catcherFallback(error, wretch)

      throw error
    })
  }
  // Enforces the proper promise type when a body parsing method is called.
  type BodyParser = <Type>(funName: "json" | "blob" | "formData" | "arrayBuffer" | "text" | null) => <Result = void>(cb?: (type: Type) => Result) => Promise<Awaited<Result>>
  const bodyParser: BodyParser = funName => cb => funName ?
    // If a callback is provided, then callback with the body result otherwise return the parsed body itself.
    catchersWrapper(throwingPromise.then(_ => _ && _[funName]()).then(_ => cb ? cb(_) : _)) :
    // No body parsing method - return the response
    catchersWrapper(throwingPromise.then(_ => cb ? cb(_ as any) : _))

  const responseChain: WretchResponseChain<T, Chain, R> = {
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
    ...(typeof addon.resolver === "function" ? (addon.resolver as (_: WretchResponseChain<T, Chain, R>) => any)(chain) : addon.resolver)
  }), responseChain)

  return resolvers.reduce((chain, r) => r(chain, wretch), enhancedResponseChain)
}
