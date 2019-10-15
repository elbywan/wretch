import { Wretcher } from "./wretcher"
import { mix } from "./mix"
import conf from "./config"
import perfs from "./perfs"
import { middlewareHelper } from "./middleware"

export type WretcherError = Error & { status: number, response: WretcherResponse, text?: string, json?: any }
export type WretcherErrorCallback = (error: WretcherError, originalRequest: Wretcher) => any
export type WretcherResponse = Response & { [key: string]: any }
export type ResponseChain = {
    // Response types
    res: <Result = WretcherResponse>(cb?: (type: WretcherResponse) => Result) => Promise<Result>,
    json: <Result = {[key: string]: any}>(cb?: (type: {[key: string]: any}) => Result) => Promise<Result>,
    blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>,
    formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>,
    arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>,
    text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>,
    // Extras
    perfs: (cb?: (timing: any) => void) => ResponseChain,
    setTimeout: (time: number, controller?: AbortController) => ResponseChain,
    controller: () => [any, ResponseChain],
    // Catchers
    error: (code: (number | string), cb: WretcherErrorCallback) => ResponseChain,
    badRequest: (cb: WretcherErrorCallback) => ResponseChain,
    unauthorized: (cb: WretcherErrorCallback) => ResponseChain,
    forbidden: (cb: WretcherErrorCallback) => ResponseChain,
    notFound: (cb: WretcherErrorCallback) => ResponseChain,
    timeout: (cb: WretcherErrorCallback) => ResponseChain,
    internalError: (cb: WretcherErrorCallback) => ResponseChain,
    onAbort: (cb: WretcherErrorCallback) => ResponseChain
}

export const resolver = (wretcher: Wretcher) => {
    const {
        _url: url,
        _catchers: _catchers,
        _resolvers: resolvers,
        _middlewares: middlewares,
        _options: opts
    } = wretcher
    const catchers = new Map(_catchers)
    const finalOptions = mix(conf.defaults, opts)
    const fetchController = conf.polyfill("AbortController", { doThrow: false, instance: true })
    if(!finalOptions["signal"] && fetchController) {
        finalOptions["signal"] = fetchController.signal
    }
    // Request timeout
    const timeout = {
        ref: null,
        clear() {
            if(timeout.ref) {
                clearTimeout(timeout.ref)
                timeout.ref = null
            }
        }
    }
    // The generated fetch request
    const fetchRequest = middlewareHelper(middlewares)(conf.polyfill("fetch"))(url, finalOptions)
    // Throws on an http error
    const throwingPromise: Promise<void | WretcherResponse> = fetchRequest.then(response => {
        timeout.clear()
        if (!response.ok) {
            return response[conf.errorType || "text"]().then(msg => {
                // Enhances the error object
                const err = new Error(msg)
                err[conf.errorType || "text"] = msg
                err["status"] = response.status
                err["response"] = response
                throw err
            })
        }
        return response
    })
    // Wraps the Promise in order to dispatch the error to a matching catcher
    const catchersWrapper = <T>(promise: Promise<T>): Promise<void | T> => {
        return promise.catch(err => {
            timeout.clear()
            if(catchers.has(err.status))
                return catchers.get(err.status)(err, wretcher)
            else if(catchers.has(err.name))
                return catchers.get(err.name)(err, wretcher)
            else
                throw err
        })
    }
    // Enforces the proper promise type when a body parsing method is called.
    type BodyParser = <Type>(funName: string | null) => <Result = void>(cb?: (type: Type) => Result) => Promise<Result>
    const bodyParser: BodyParser = <T>(funName) => <R>(cb) => funName ?
        // If a callback is provided, then callback with the body result otherwise return the parsed body itself.
        catchersWrapper(throwingPromise.then(_ => _ && _[funName]()).then(_ => cb ? cb(_) : _)) :
        // No body parsing method - return the response
        catchersWrapper(throwingPromise.then(_ => cb ? cb(_) : _))

    const responseChain: ResponseChain = {
        /**
         * Retrieves the raw result as a promise.
         */
        res: bodyParser<WretcherResponse>(null),
        /**
         * Retrieves the result as a parsed JSON object.
         */
        json: bodyParser<any>("json"),
        /**
         * Retrieves the result as a Blob object.
         */
        blob: bodyParser<Blob>("blob"),
        /**
         * Retrieves the result as a FormData object.
         */
        formData: bodyParser<FormData>("formData"),
        /**
         * Retrieves the result as an ArrayBuffer object.
         */
        arrayBuffer: bodyParser<ArrayBuffer>("arrayBuffer"),
        /**
         * Retrieves the result as a string.
         */
        text: bodyParser<string>("text"),
        /**
         * Performs a callback on the API performance timings of the request.
         *
         * Warning: Still experimental on browsers and node.js
         */
        perfs: cb => {
            fetchRequest.then(res => perfs.observe(res.url, cb))
            return responseChain
        },
        /**
         * Aborts the request after a fixed time.
         *
         * @param time Time in milliseconds
         * @param controller A custom controller
         */
        setTimeout: (time, controller = fetchController) => {
            timeout.clear()
            timeout.ref = setTimeout(() => controller.abort(), time)
            return responseChain
        },
        /**
         * Returns the automatically generated AbortController alongside the current wretch response as a pair.
         */
        controller: () => [ fetchController, responseChain ],
        /**
         * Catches an http response with a specific error code or name and performs a callback.
         */
        error(errorId, cb) {
            catchers.set(errorId, cb)
            return responseChain
        },
        /**
         * Catches a bad request (http code 400) and performs a callback.
         */
        badRequest: cb => responseChain.error(400, cb),
        /**
         * Catches an unauthorized request (http code 401) and performs a callback.
         */
        unauthorized: cb => responseChain.error(401, cb),
        /**
         * Catches a forbidden request (http code 403) and performs a callback.
         */
        forbidden: cb => responseChain.error(403, cb),
        /**
         * Catches a "not found" request (http code 404) and performs a callback.
         */
        notFound: cb => responseChain.error(404, cb),
        /**
         * Catches a timeout (http code 408) and performs a callback.
         */
        timeout: cb => responseChain.error(408, cb),
        /**
         * Catches an internal server error (http code 500) and performs a callback.
         */
        internalError: cb => responseChain.error(500, cb),
        /**
         * Catches an AbortError and performs a callback.
         */
        onAbort: cb => responseChain.error("AbortError", cb)
    }

    return resolvers.reduce((chain, r) => r(chain, wretcher), responseChain) as (ResponseChain & Promise<any>)
}
