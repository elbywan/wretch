import { mix } from "./mix"
import conf from "./config"

export type WretcherError = Error & { status: number, response: Response, text?: string, json?: any }

export const resolver = url => (catchers: Map<number, (error: WretcherError) => void> = new Map()) => (opts = {}) => {
    const req = fetch(url, mix(conf.defaults, opts))
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

    type TypeParser = <Type>(funName: string | null) => <Result = void>(cb?: (type: Type) => Result) => Promise<Result>

    const doCatch = <T>(promise: Promise<T>): Promise<void | T> => {
        return promise.catch(err => {
            if(catchers.has(err.status))
                catchers.get(err.status)(err)
            else
                throw err
        })
    }
    const wrapTypeParser: TypeParser = <T>(funName) => <R>(cb) => funName ?
        doCatch(wrapper.then(_ => _ && _[funName]()).then(_ => _ && cb && cb(_) || _)) :
        doCatch(wrapper.then(_ => _ && cb && cb(_) || _))

    const responseTypes: {
        res: <Result = Response>(cb?: (type: void) => Result) => Promise<Result>,
        json: <Result = {[key: string]: any}>(cb?: (type: {[key: string]: any}) => Result) => Promise<Result>,
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>,
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>,
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>,
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>,
        error: (code: number, cb: any) => typeof responseTypes,
        badRequest: (cb: (error: WretcherError) => void) => typeof responseTypes,
        unauthorized: (cb: (error: WretcherError) => void) => typeof responseTypes,
        forbidden: (cb: (error: WretcherError) => void) => typeof responseTypes,
        notFound: (cb: (error: WretcherError) => void) => typeof responseTypes,
        timeout: (cb: (error: WretcherError) => void) => typeof responseTypes,
        internalError: (cb: (error: WretcherError) => void) => typeof responseTypes
    } = {
        /**
         * Retrieves the raw result as a promise.
         */
        res: wrapTypeParser<void>(null),
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
         * Catches an http response with a specific error code and performs a callback.
         */
        error(code: number, cb) {
            catchers.set(code, cb)
            return responseTypes
        },
        /**
         * Catches a bad request (http code 400) and performs a callback.
         */
        badRequest: cb => responseTypes.error(400, cb),
        /**
         * Catches an unauthorized request (http code 401) and performs a callback.
         */
        unauthorized: cb => responseTypes.error(401, cb),
        /**
         * Catches a forbidden request (http code 403) and performs a callback.
         */
        forbidden: cb => responseTypes.error(403, cb),
        /**
         * Catches a "not found" request (http code 404) and performs a callback.
         */
        notFound: cb => responseTypes.error(404, cb),
        /**
         * Catches a timeout (http code 408) and performs a callback.
         */
        timeout: cb => responseTypes.error(408, cb),
        /**
         * Catches an internal server error (http code 500) and performs a callback.
         */
        internalError: cb => responseTypes.error(500, cb)
    }

    return responseTypes
}
