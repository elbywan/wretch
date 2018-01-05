import { mix } from "./mix"
import conf from "./config"
import { resolver, WretcherError, ResponseChain } from "./resolver"
import { ConfiguredMiddleware } from "./middleware"

/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
export class Wretcher {

    protected constructor(
        public _url: string,
        public _options: RequestInit,
        public _catchers: Map<number | string, (error: WretcherError, originalRequest: Wretcher) => void> = new Map(),
        public _resolvers: Array<(resolver: ResponseChain, originalRequest: Wretcher) => any> = [],
        public _middlewares: ConfiguredMiddleware[] = []) {}

    static factory(url = "", opts: RequestInit = {}) { return new Wretcher(url, opts) }
    private selfFactory({ url = this._url, options = this._options, catchers = this._catchers,
                resolvers = this._resolvers, middlewares = this._middlewares } = {}) {
        return new Wretcher(url, options, catchers, resolvers, middlewares)
    }

    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param opts New default options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    defaults(opts: RequestInit, mixin = false) {
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
        conf.polyfills = { ...conf.polyfills, ...polyfills}
        return this
    }

    /**
     * Returns a new Wretcher object with the argument url appended and the same options.
     * @param url String url
     * @param replace Boolean If true, replaces the current url instead of appending
     */
    url(url: string, replace = false) {
        return replace ? this.selfFactory({ url }) : this.selfFactory({ url: this._url + url })
    }

    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    options(options: RequestInit, mixin = true) {
        return this.selfFactory({ options: mixin ? mix(this._options, options) : options })
    }

    /**
     * Converts a javascript object to query parameters,
     * then appends this query string to the current url.
     *
     * ```
     * let w = wretch("http://example.com") // url is http://example.com
     * w = w.query({ a: 1, b : 2 }) // url is now http://example.com?a=1&b=2
     * ```
     *
     * @param qp An object which will be converted.
     */
    query(qp: object) {
        return this.selfFactory({ url: appendQueryParams(this._url, qp) })
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
     * Add middlewares to intercept a request before being sent.
     */
    middlewares(middlewares: ConfiguredMiddleware[], clear = false) {
        return this.selfFactory({
            middlewares: clear ? middlewares : [ ...this._middlewares, ...middlewares ]
        })
    }

    private method(method, opts) {
        return resolver(this.options({ ...opts, method }))
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

const appendQueryParams = (url: string, qp: object) => {
    const usp = conf.polyfill("URLSearchParams", true, true)
    const index = url.indexOf("?")
    for(const key in qp) {
        if(qp[key] instanceof Array) {
            for(const val of qp[key])
                usp.append(key, val)
        } else {
            usp.append(key, qp[key])
        }
    }
    return ~index ?
        `${url.substring(0, index)}?${usp.toString()}` :
        `${url}?${usp.toString()}`
}

const convertFormData = (formObject: object) => {
    const formData = conf.polyfill("FormData", true, true)
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
