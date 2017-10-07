import { mix } from "./mix"
import conf from "./config"
import perfs from "./perfs"

export type WretcherError = Error & { status: number, response: Response, text?: string, json?: any }

export const resolver = url => (catchers: Map<number, (error: WretcherError) => void> = new Map()) => (opts = {}) => {
    type TypeParser = <Type>(funName: string | null) => <Result = void>(cb?: (type: Type) => Result) => Promise<Result>

    const finalOpts = mix(conf.defaults, opts)
    const fetchController = conf.polyfill("AbortController", false, true)
    if(!finalOpts["signal"] && fetchController) {
        finalOpts["signal"] = fetchController.signal
    }

    const req = conf.polyfill("fetch")(url, finalOpts)
    const wrapper: Promise<void | Response> = req.then(response => {
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

    const nameCatchers = new Map()
    const doCatch = <T>(promise: Promise<T>): Promise<void | T> => {
        return promise.catch(err => {
            if(catchers.has(err.status))
                catchers.get(err.status)(err)
            else if(nameCatchers.has(err.name))
                nameCatchers.get(err.name)(err)
            else
                throw err
        })
    }
    const wrapTypeParser: TypeParser = <T>(funName) => <R>(cb) => funName ?
        doCatch(wrapper.then(_ => _ && _[funName]()).then(_ => _ && cb && cb(_) || _)) :
        doCatch(wrapper.then(_ => _ && cb && cb(_) || _))

    const responseChain: {
        // Response types
        res: <Result = Response>(cb?: (type: Response) => Result) => Promise<Result>,
        json: <Result = {[key: string]: any}>(cb?: (type: {[key: string]: any}) => Result) => Promise<Result>,
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>,
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>,
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>,
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>,
        // Extras
        perfs: (cb?: (type: any) => void) => typeof responseChain,
        setTimeout: (time: number, controller: any) => typeof responseChain,
        controller: () => [any, typeof responseChain],
        // Catchers
        error: (code: (number | string), cb: any) => typeof responseChain,
        badRequest: (cb: (error: WretcherError) => void) => typeof responseChain,
        unauthorized: (cb: (error: WretcherError) => void) => typeof responseChain,
        forbidden: (cb: (error: WretcherError) => void) => typeof responseChain,
        notFound: (cb: (error: WretcherError) => void) => typeof responseChain,
        timeout: (cb: (error: WretcherError) => void) => typeof responseChain,
        internalError: (cb: (error: WretcherError) => void) => typeof responseChain,
        onAbort: (cb: (error: Error) => void) => typeof responseChain
    } = {
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
         * Catches an http response with a specific error code and performs a callback.
         */
        error(code, cb) {
            typeof code === "string" ?
                nameCatchers.set(code, cb) :
                catchers.set(code, cb)
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

    return responseChain
}
