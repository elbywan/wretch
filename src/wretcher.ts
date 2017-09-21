import { mix } from "./mix"
import conf from "./config"
import { resolver } from "./resolver"

/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
export class Wretcher {

    constructor(
        private _url: string,
        private _options = {}) {}

    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param opts New default options
     */
    defaults(opts: object) {
        conf.defaults = opts
        return this
    }

    /**
     * Mixins the default fetch options used for every subsequent fetch calls.
     * @param opts Options to mixin with the current default options
     */
    mixdefaults(opts: object) {
        conf.defaults = mix(conf.defaults, opts)
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
     * Returns a new Wretcher object with the url specified and the same options.
     * @param url String url
     */
    url(url: string) {
        return new Wretcher(url, this._options)
    }

    /**
     * Returns a wretch factory which, when called, creates a new Wretcher object with the base url as an url prefix.
     * @param baseurl The base url
     */
    baseUrl(baseurl: string) {
        return (url = "", opts = {}) => new Wretcher(baseurl + url, opts)
    }

    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     */
    options(options: object) {
        return new Wretcher(this._url, options)
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
        return new Wretcher(appendQueryParams(this._url, qp), this._options)
    }

    /**
     * Shortcut to set the "Accept" header.
     * @param what Header value
     */
    accept(what: string) {
        return new Wretcher(this._url, mix(this._options, { headers: { Accept : what }}))
    }

    /**
     * Performs a get request.
     */
    get(opts = {}) {
        return resolver(this._url)(mix(opts, this._options))
    }
    /**
     * Performs a delete request.
     */
    delete(opts = {}) {
        return resolver(this._url)({ ...mix(opts, this._options), method: "DELETE" })
    }
    /**
     * Performs a put request.
     */
    put(opts = {}) {
        return resolver(this._url)({ ...mix(opts, this._options), method: "PUT" })
    }
    /**
     * Performs a post request.
     */
    post(opts = {}) {
        return resolver(this._url)({ ...mix(opts, this._options), method: "POST" })
    }
    /**
     * Performs a patch request.
     */
    patch(opts = {}) {
        return resolver(this._url)({ ...mix(opts, this._options), method: "PATCH" })
    }

    /**
     * Sets the content type header, stringifies an object and sets the request body.
     * @param jsObject An object
     */
    json(jsObject: object) {
        return new Wretcher(this._url, {
            ...this._options,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsObject)
        })
    }
    /**
     * Converts the javascript object to a FormData and sets the request body.
     * @param formObject An object
     */
    formData(formObject: object) {
        const formData = new FormData()
        for(const key in formObject) {
            if(formObject[key] instanceof Array) {
                for(const item of formObject[key])
                    formData.append(key + "[]", item)
            } else {
                formData.append(key, formObject[key])
            }
        }

        return new Wretcher(this._url, {
            ...this._options,
            body: formData
        })
    }
}

// Internal helpers

const appendQueryParams = (url: string, qp: object) => {
    const usp = new URLSearchParams()
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
