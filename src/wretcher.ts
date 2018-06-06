import { mix } from "./mix"
import conf from "./config"
import { resolver, WretcherError, ResponseChain } from "./resolver"
import { ConfiguredMiddleware } from "./middleware"

export type WretcherOptions = RequestInit & {
    [key: string]: any
}

export type DeferredCallback = (wretcher: Wretcher, url: string, options: WretcherOptions) => Wretcher

/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
export class Wretcher {

    protected constructor(
        public _url: string,
        public _options: WretcherOptions,
        public _catchers: Map<number | string, (error: WretcherError, originalRequest: Wretcher) => void> = new Map(),
        public _resolvers: Array<(resolver: ResponseChain, originalRequest: Wretcher) => any> = [],
        public _middlewares: ConfiguredMiddleware[] = [],
        public _deferredChain: DeferredCallback[] = []) {}

    static factory(url = "", opts: WretcherOptions = {}) { return new Wretcher(url, opts) }
    private selfFactory({ url = this._url, options = this._options, catchers = this._catchers,
                resolvers = this._resolvers, middlewares = this._middlewares, deferredChain = this._deferredChain } = {}) {
        return new Wretcher(url, options, catchers, resolvers, middlewares, deferredChain)
    }

    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param opts New default options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    defaults(opts: WretcherOptions, mixin = false) {
        conf.defaults = mixin ? mix(conf.defaults, opts) : opts
        return this
    }

    /**
     * Sets the method (text, json ...) used to parse the data contained in the response body in case of an HTTP error.
     *
     * Persists for every subsequent requests.
     *
     * Default is "text".
     */
    errorType(method: "text" | "json") {
        conf.errorType = method
        return this
    }

    /**
     * Sets the non-global polyfills which will be used for every subsequent calls.
     *
     * Needed for libraries like [fetch-ponyfill](https://github.com/qubyte/fetch-ponyfill).
     *
     * @param polyfills An object containing the polyfills.
     */
    polyfills(polyfills: Partial<typeof conf.polyfills>) {
        conf.polyfills = { ...conf.polyfills, ...polyfills }
        return this
    }

    /**
     * Returns a new Wretcher object with the argument url appended and the same options.
     * @param url String url
     * @param replace Boolean If true, replaces the current url instead of appending
     */
    url(url: string, replace = false) {
        if(replace)
            return this.selfFactory({ url })
        const split = this._url.split("?")
        return this.selfFactory({
            url: split.length > 1 ?
                split[0] + url + "?" + split[1] :
                this._url + url
        })
    }

    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    options(options: WretcherOptions, mixin = true) {
        return this.selfFactory({ options: mixin ? mix(this._options, options) : options })
    }

    /**
     * Converts a javascript object to query parameters,
     * then appends this query string to the current url.
     *
     * If given a string, use the string as the query verbatim.
     *
     * ```
     * let w = wretch("http://example.com") // url is http://example.com
     *
     * // Chain query calls
     * w = w.query({ a: 1, b : 2 }) // url is now http://example.com?a=1&b=2
     * w = w.query("foo-bar-baz-woz") // url is now http://example.com?a=1&b=2&foo-bar-baz-woz
     *
     * // Pass true as the second argument to replace existing query parameters
     * w = w.query("c=3&d=4", true) // url is now http://example.com?c=3&d=4
     * ```
     *
     * @param qp An object which will be converted, or a string which will be used verbatim.
     */
    query(qp: object | string, replace: boolean = false) {
        return this.selfFactory({ url: appendQueryParams(this._url, qp, replace) })
    }

    /**
     * Set request headers.
     * @param headerValues An object containing header keys and values
     */
    headers(headerValues: { [headerName: string]: any }) {
        return this.selfFactory({ options: mix(this._options, { headers: headerValues }) })
    }

    /**
     * Shortcut to set the "Accept" header.
     * @param headerValue Header value
     */
    accept(headerValue: string) {
        return this.headers({ Accept : headerValue })
    }

    /**
     * Shortcut to set the "Content-Type" header.
     * @param headerValue Header value
     */
    content(headerValue: string) {
        return this.headers({ "Content-Type" : headerValue })
    }

    /**
     * Shortcut to set the "Authorization" header.
     * @param headerValue Header value
     */
    auth(headerValue: string) {
        return this.headers({ Authorization: headerValue })
    }

    /**
     * Adds a default catcher which will be called on every subsequent request error when the error code matches.
     * @param errorId Error code or name
     * @param catcher: The catcher method
     */
    catcher(errorId: number | string, catcher: (error: WretcherError, originalRequest: Wretcher) => any) {
        const newMap = new Map(this._catchers)
        newMap.set(errorId, catcher)
        return this.selfFactory({ catchers: newMap })
    }

    /**
     * Associates a custom signal with the request.
     * @param controller : An AbortController
     */
    signal(controller: any) {
        return this.selfFactory({ options: { ...this._options, signal: controller.signal } as any })
    }

    /**
     * Program a resolver to perform response chain tasks automatically.
     * @param doResolve : Resolver callback
     */
    resolve(doResolve: (chain: ResponseChain, originalRequest: Wretcher) => ResponseChain | Promise<any>, clear: boolean = false) {
        return this.selfFactory({ resolvers: clear ? [ doResolve ] : [ ...this._resolvers, doResolve ]})
    }

    /**
     * Defer wretcher methods that will be chained and called just before the request is performed.
     */
    defer(callback: DeferredCallback, clear = false) {
        return this.selfFactory({
            deferredChain: clear ? [callback] : [ ...this._deferredChain, callback ]
        })
    }

    /**
     * Add middlewares to intercept a request before being sent.
     */
    middlewares(middlewares: ConfiguredMiddleware[], clear = false) {
        return this.selfFactory({
            middlewares: clear ? middlewares : [ ...this._middlewares, ...middlewares ]
        })
    }

    private method(method, opts) {
        const deferredWretcher = this._deferredChain.reduce((acc: Wretcher, curr) => curr(acc, acc._url, acc._options), this)
        return resolver(deferredWretcher.options({ ...opts, method }))
    }

    /**
     * Performs a get request.
     */
    get(opts = {}) {
        return this.method("GET", opts)
    }
    /**
     * Performs a delete request.
     */
    delete(opts = {}) {
        return this.method("DELETE", opts)
    }
    /**
     * Performs a put request.
     */
    put(opts = {}) {
        return this.method("PUT", opts)
    }
    /**
     * Performs a post request.
     */
    post(opts = {}) {
        return this.method("POST", opts)
    }
    /**
     * Performs a patch request.
     */
    patch(opts = {}) {
        return this.method("PATCH", opts)
    }
    /**
     * Performs a head request.
     */
    head(opts = {}) {
        return this.method("HEAD", opts)
    }
    /**
     * Performs an options request
     */
    opts(opts = {}) {
        return this.method("OPTIONS", opts)
    }

    /**
     * Sets the request body with any content.
     * @param contents The body contents
     */
    body(contents: any) {
        return this.selfFactory({ options: { ...this._options, body: contents }})
    }
    /**
     * Sets the content type header, stringifies an object and sets the request body.
     * @param jsObject An object which will be serialized into a JSON
     */
    json(jsObject: object) {
        return this.content("application/json").body(JSON.stringify(jsObject))
    }
    /**
     * Converts the javascript object to a FormData and sets the request body.
     * @param formObject An object which will be converted to a FormData
     */
    formData(formObject: object) {
        return this.body(convertFormData(formObject))
    }
    /**
     * Converts the input to an url encoded string and sets the content-type header and body.
     * If the input argument is already a string, skips the conversion part.
     *
     * @param input An object to convert into an url encoded string or an already encoded string
     */
    formUrl(input: (object | string)) {
        return this
            .body(typeof input === "string" ? input : convertFormUrl(input))
            .content("application/x-www-form-urlencoded")
    }
}

// Internal helpers

const appendQueryParams = (url: string, qp: object | string, replace: boolean) => {
    let queryString

    if(typeof qp === "string") {
        queryString = qp
    } else {
        const usp = conf.polyfill("URLSearchParams", { instance: true })
        for(const key in qp) {
            if(qp[key] instanceof Array) {
                for(const val of qp[key])
                    usp.append(key, val)
            } else {
                usp.append(key, qp[key])
            }
        }
        queryString = usp.toString()
    }

    const split = url.split("?")
    if(replace || split.length < 2)
        return split[0] + "?" + queryString

    return url + "&" + queryString
}

const convertFormData = (formObject: object) => {
    const formData = conf.polyfill("FormData", { instance: true })
    for(const key in formObject) {
        if(formObject[key] instanceof Array) {
            for(const item of formObject[key])
                formData.append(key + "[]", item)
        } else {
            formData.append(key, formObject[key])
        }
    }

    return formData
}

const convertFormUrl = (formObject: object) => {
    return Object.keys(formObject)
        .map(key =>
            encodeURIComponent(key) + "=" +
            `${ encodeURIComponent(typeof formObject[key] === "object" ? JSON.stringify(formObject[key]) : formObject[key]) }`)
        .join("&")
}
