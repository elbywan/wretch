import { Wretch } from "./core"
import { middlewareHelper } from "./middleware"
import { mix } from "./utils"
import type { WretchResponse, WretchErrorCallback } from "./types"

class WretchErrorWrapper {
  constructor(public error: any) { }
}

export interface WretchResponseChain<T, Self = unknown> {
  wretchRequest: Wretch<T, Self>,
  fetchRequest: Promise<WretchResponse>,

  /**
   * Retrieves the raw result as a promise.
   */
  res: <Result = WretchResponse>(cb?: (type: WretchResponse) => Result) => Promise<Result>,
  /**
   * Retrieves the result as a parsed JSON object.
   */
  json: <Result = { [key: string]: any }>(cb?: (type: { [key: string]: any }) => Result) => Promise<Result>,
  /**
   * Retrieves the result as a Blob object.
   */
  blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>,
  /**
   * Retrieves the result as a FormData object.
   */
  formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>,
  /**
   * Retrieves the result as an ArrayBuffer object.
   */
  arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>,
  /**
   * Retrieves the result as a string.
   */
  text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>,

  /**
   * Catches an http response with a specific error code or name and performs a callback.
   */
  error: (this: Self & WretchResponseChain<T, Self>, code: (number | string), cb: WretchErrorCallback<T, Self>) => this,
  /**
   * Catches a bad request (http code 400) and performs a callback.
   */
  badRequest: (this: Self & WretchResponseChain<T, Self>, cb: WretchErrorCallback<T, Self>) => this,
  /**
   * Catches an unauthorized request (http code 401) and performs a callback.
   */
  unauthorized: (this: Self & WretchResponseChain<T, Self>, cb: WretchErrorCallback<T, Self>) => this,
  /**
   * Catches a forbidden request (http code 403) and performs a callback.
   */
  forbidden: (this: Self & WretchResponseChain<T, Self>, cb: WretchErrorCallback<T, Self>) => this,
  /**
   * Catches a "not found" request (http code 404) and performs a callback.
   */
  notFound: (this: Self & WretchResponseChain<T, Self>, cb: WretchErrorCallback<T, Self>) => this,
  /**
   * Catches a timeout (http code 408) and performs a callback.
   */
  timeout: (this: Self & WretchResponseChain<T, Self>, cb: WretchErrorCallback<T, Self>) => this,
  /**
   * Catches an internal server error (http code 500) and performs a callback.
   */
  internalError: (this: Self & WretchResponseChain<T, Self>, cb: WretchErrorCallback<T, Self>) => this,
  /**
   * Catches errors thrown when calling the fetch function and performs a callback.
   */
  fetchError: (this: Self & WretchResponseChain<T, Self>, cb: WretchErrorCallback<T, Self>) => this,
}

export const resolver = <T, Chain>(wretch: Wretch<T, Chain>) => {
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
  const finalOptions = mix(config.defaults, opts)
  addons.forEach(addon => addon.beforeRequest && addon.beforeRequest(wretch, finalOptions))
  // The generated fetch request
  const fetchRequest = middlewareHelper(middlewares)(config.polyfill("fetch"))(url, finalOptions)
  // Throws on an http error
  const throwingPromise: Promise<void | WretchResponse> = fetchRequest
    .catch(error => {
      throw new WretchErrorWrapper(error)
    })
    .then(response => {
      if (!response.ok) {
        if (response.type === "opaque") {
          const err = new Error("Opaque response")
          err["response"] = response
          throw err
        }
        return response[config.errorType || "text"]().then(body => {
          // Enhances the error object
          const err = new Error(body)
          err[config.errorType || "text"] = body
          err["response"] = response
          err["status"] = response.status
          throw err
        })
      }
      return response
    })
  // Wraps the Promise in order to dispatch the error to a matching catcher
  const catchersWrapper = <T>(promise: Promise<T>): Promise<void | T> => {
    return promise.catch(err => {
      const error = err instanceof WretchErrorWrapper ? err.error : err
      if (err instanceof WretchErrorWrapper && catchers.has("__fetchError__"))
        return catchers.get("__fetchError__")(error, wretch)
      else if (catchers.has(error.status))
        return catchers.get(error.status)(error, wretch)
      else if (catchers.has(error.name))
        return catchers.get(error.name)(error, wretch)
      else
        throw error
    })
  }
  // Enforces the proper promise type when a body parsing method is called.
  type BodyParser = <Type>(funName: string | null) => <Result = void>(cb?: (type: Type) => Result) => Promise<Result>
  const bodyParser: BodyParser = funName => cb => funName ?
    // If a callback is provided, then callback with the body result otherwise return the parsed body itself.
    catchersWrapper(throwingPromise.then(_ => _ && _[funName]()).then(_ => cb ? cb(_) : _)) :
    // No body parsing method - return the response
    catchersWrapper(throwingPromise.then(_ => cb ? cb(_ as any) : _))

  const responseChain: WretchResponseChain<T> = {
    wretchRequest: wretch,
    fetchRequest,
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
    fetchError(cb) { return this.error("__fetchError__", cb) },
  }

  const enhancedResponseChain: Chain & WretchResponseChain<T, Chain> = addons.reduce((chain, addon) => ({
    ...chain,
    ...(addon.resolver as any)
  }), responseChain)

  return resolvers.reduce((chain, r) => r(chain, wretch), enhancedResponseChain) as (Chain & WretchResponseChain<T, Chain> & Promise<any>)
}
