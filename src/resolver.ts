import { Wretcher } from "./wretcher"
import { mix } from "./mix"
import conf from "./config"
import perfs from "./perfs"
import { middlewareHelper, ConfiguredMiddleware } from "./middleware"

export type WretcherError = Error & { status: number, response: WretcherResponse, text?: string, json?: any }
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
    perfs: (cb?: (type: any) => void) => ResponseChain,
    setTimeout: (time: number, controller?: any) => ResponseChain,
    controller: () => [any, ResponseChain],
    // Catchers
    error: (code: (number | string), cb: any) => ResponseChain,
    badRequest: (cb: (error: WretcherError, originalRequest: Wretcher) => void) => ResponseChain,
    unauthorized: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain,
    forbidden: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain,
    notFound: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain,
    timeout: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain,
    internalError: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain,
    onAbort: (cb: (error: Error, originalRequest: Wretcher) => any) => ResponseChain
}

export const resolver = (wretcher: Wretcher) => {
    const {
        _url: url,
        _catchers: catchers,
        _resolvers: resolvers,
        _middlewares: middlewares,
        _options: opts
    } = wretcher

    type TypeParser = <Type>(funName: string | null) => <Result = void>(cb?: (type: Type) => Result) => Promise<Result>

    const finalOpts = mix(conf.defaults, opts)
    const fetchController = conf.polyfill("AbortController", { doThrow: false, instance: true })
    if(!finalOpts["signal"] && fetchController) {
        finalOpts["signal"] = fetchController.signal
    }

    const req = middlewareHelper(middlewares)(conf.polyfill("fetch"))(url, finalOpts)
    const wrapper: Promise<void | WretcherResponse> = req.then(response => {
        if (!response.ok) {
            return response[conf.errorType || "text"]().then(_ => {
                const err = new Error(_)
                err[conf.errorType] = _
                err["status"] = response.status
                err["response"] = response
                throw err
            })
        }
        return response
    })

    const doCatch = <T>(promise: Promise<T>): Promise<void | T> => {
        return promise.catch(err => {
            if(catchers.has(err.status))
                return catchers.get(err.status)(err, wretcher)
            else if(catchers.has(err.name))
                return catchers.get(err.name)(err, wretcher)
            else
                throw err
        })
    }
    const wrapTypeParser: TypeParser = <T>(funName) => <R>(cb) => funName ?
        doCatch(wrapper.then(_ => _ && _[funName]()).then(_ => _ && cb && cb(_) || _)) :
        doCatch(wrapper.then(_ => _ && cb && cb(_) || _))

    const responseChain: ResponseChain = {
        /**
         * Retrieves the raw result as a promise.
         */
        res: wrapTypeParser<Response>(null),
        /**
         * Retrieves the result as a parsed JSON object.
         */
        json: wrapTypeParser<any>("json"),
        /**
         * Retrieves the result as a Blob object.
         */
        blob: wrapTypeParser<Blob>("blob"),
        /**
         * Retrieves the result as a FormData object.
         */
        formData: wrapTypeParser<FormData>("formData"),
        /**
         * Retrieves the result as an ArrayBuffer object.
         */
        arrayBuffer: wrapTypeParser<ArrayBuffer>("arrayBuffer"),
        /**
         * Retrieves the result as a string.
         */
        text: wrapTypeParser<string>("text"),
        /**
         * Performs a callback on the API performance timings of the request.
         *
         * Warning: Still experimental on browsers and node.js
         */
        perfs: cb => {
            req.then(res => perfs.observe(res.url, cb))
            return responseChain
        },
        /**
         * Aborts the request after a fixed time.
         *
         * @param time Time in milliseconds
         * @param controller A custom controller
         */
        setTimeout: (time, controller = fetchController) => {
            setTimeout(() => controller.abort(), time)
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
