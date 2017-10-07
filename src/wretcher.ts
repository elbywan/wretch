import { mix } from "./mix"
import conf from "./config"
import { resolver, WretcherError } from "./resolver"

/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
export class Wretcher {

    protected constructor(
        private _url: string,
        private _options: RequestInit = {},
        private _catchers: Map<number, (error: WretcherError) => void> = new Map()) {}

    static factory(url = "", opts: RequestInit = {}) { return new Wretcher(url, opts) }
    private selfFactory({ url = this._url, options = this._options, catchers = this._catchers } = {}) {
        return new Wretcher(url, options, catchers)
    }

    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param opts New default options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    defaults(opts: RequestInit, mixin = false) {
        conf.defaults = mixin ? conf.defaults = mix(conf.defaults, opts) : opts
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
     * @param replace Boolean it true, replaces the current url instead of appending
     */
    url(url: string, replace = false) {
        return replace ? this.selfFactory({ url }) : this.selfFactory({ url: this._url + url })
    }

    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    options(options: RequestInit, mixin = false) {
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
     * Adds a default catcher which will be called on every subsequent request error when the error code matches.
     * @param code Error code
     * @param catcher: The catcher method
     */
    catcher(code: number, catcher: (error: WretcherError) => void) {
        const newMap = new Map(this._catchers)
        newMap.set(code, catcher)
        return this.selfFactory({ catchers: newMap })
    }

    /**
     * Associates a custom signal with the request.
     * @param controller : An AbortController
     */
    signal(controller: any) {
        return this.selfFactory({ options: { ...this._options, signal: controller.signal } as any })
    }

    /**
     * Performs a get request.
     */
    get(opts = {}) {
        return resolver(this._url)(this._catchers)(mix(opts, this._options))
    }
    /**
     * Performs a delete request.
     */
    delete(opts = {}) {
        return resolver(this._url)(this._catchers)({ ...mix(opts, this._options), method: "DELETE" })
    }
    /**
     * Performs a put request.
     */
    put(opts = {}) {
        return resolver(this._url)(this._catchers)({ ...mix(opts, this._options), method: "PUT" })
    }
    /**
     * Performs a post request.
     */
    post(opts = {}) {
        return resolver(this._url)(this._catchers)({ ...mix(opts, this._options), method: "POST" })
    }
    /**
     * Performs a patch request.
     */
    patch(opts = {}) {
        return resolver(this._url)(this._catchers)({ ...mix(opts, this._options), method: "PATCH" })
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
