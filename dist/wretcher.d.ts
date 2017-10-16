import conf from "./config";
import { WretcherError, ResponseChain } from "./resolver";
/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
export declare class Wretcher {
    private _url;
    private _options;
    private _catchers;
    private _resolvers;
    protected constructor(_url: string, _options: RequestInit, _catchers?: Map<number | string, (error: WretcherError) => void>, _resolvers?: Array<(resolver: ResponseChain) => any>);
    static factory(url?: string, opts?: RequestInit): Wretcher;
    private selfFactory({url, options, catchers, resolvers}?);
    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param opts New default options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    defaults(opts: RequestInit, mixin?: boolean): this;
    /**
     * Sets the method (text, json ...) used to parse the data contained in the response body in case of an HTTP error.
     *
     * Persists for every subsequent requests.
     *
     * Default is "text".
     */
    errorType(method: "text" | "json"): this;
    /**
     * Sets the non-global polyfills which will be used for every subsequent calls.
     *
     * Needed for libraries like [fetch-ponyfill](https://github.com/qubyte/fetch-ponyfill).
     *
     * @param polyfills An object containing the polyfills.
     */
    polyfills(polyfills: Partial<typeof conf.polyfills>): this;
    /**
     * Returns a new Wretcher object with the argument url appended and the same options.
     * @param url String url
     * @param replace Boolean If true, replaces the current url instead of appending
     */
    url(url: string, replace?: boolean): Wretcher;
    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    options(options: RequestInit, mixin?: boolean): Wretcher;
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
    query(qp: object): Wretcher;
    /**
     * Set request headers.
     * @param headerValues An object containing header keys and values
     */
    headers(headerValues: {
        [headerName: string]: any;
    }): Wretcher;
    /**
     * Shortcut to set the "Accept" header.
     * @param headerValue Header value
     */
    accept(headerValue: string): Wretcher;
    /**
     * Shortcut to set the "Content-Type" header.
     * @param headerValue Header value
     */
    content(headerValue: string): Wretcher;
    /**
     * Shortcut to set the "Authorization" header.
     * @param headerValue Header value
     */
    auth(headerValue: string): Wretcher;
    /**
     * Adds a default catcher which will be called on every subsequent request error when the error code matches.
     * @param errorId Error code or name
     * @param catcher: The catcher method
     */
    catcher(errorId: number | string, catcher: (error: WretcherError) => void): Wretcher;
    /**
     * Associates a custom signal with the request.
     * @param controller : An AbortController
     */
    signal(controller: any): Wretcher;
    /**
     * Program a resolver to perform response chain tasks automatically.
     * @param doResolve : Resolver callback
     */
    resolve(doResolve: (chain: ResponseChain) => ResponseChain | Promise<any>, clear?: boolean): Wretcher;
    /**
     * Performs a get request.
     */
    get(opts?: {}): ResponseChain & Promise<any>;
    /**
     * Performs a delete request.
     */
    delete(opts?: {}): ResponseChain & Promise<any>;
    /**
     * Performs a put request.
     */
    put(opts?: {}): ResponseChain & Promise<any>;
    /**
     * Performs a post request.
     */
    post(opts?: {}): ResponseChain & Promise<any>;
    /**
     * Performs a patch request.
     */
    patch(opts?: {}): ResponseChain & Promise<any>;
    /**
     * Performs a head request.
     */
    head(opts?: {}): ResponseChain & Promise<any>;
    /**
     * Performs an options request
     */
    opts(opts?: {}): ResponseChain & Promise<any>;
    /**
     * Sets the request body with any content.
     * @param contents The body contents
     */
    body(contents: any): Wretcher;
    /**
     * Sets the content type header, stringifies an object and sets the request body.
     * @param jsObject An object which will be serialized into a JSON
     */
    json(jsObject: object): Wretcher;
    /**
     * Converts the javascript object to a FormData and sets the request body.
     * @param formObject An object which will be converted to a FormData
     */
    formData(formObject: object): Wretcher;
    /**
     * Converts the input to an url encoded string and sets the content-type header and body.
     * If the input argument is already a string, skips the conversion part.
     *
     * @param input An object to convert into an url encoded string or an already encoded string
     */
    formUrl(input: (object | string)): Wretcher;
}
