import conf from "./config";
import { WretcherError, ResponseChain } from "./resolver";
import { ConfiguredMiddleware } from "./middleware";
export declare type WretcherOptions = RequestInit & {
    [key: string]: any;
};
export declare type DeferredCallback = (wretcher: Wretcher, url: string, options: WretcherOptions) => Wretcher;
/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
export declare class Wretcher {
    _url: string;
    _options: WretcherOptions;
    _catchers: Map<number | string, (error: WretcherError, originalRequest: Wretcher) => void>;
    _resolvers: Array<(resolver: ResponseChain, originalRequest: Wretcher) => any>;
    _middlewares: ConfiguredMiddleware[];
    _deferredChain: DeferredCallback[];
    protected constructor(_url: string, _options: WretcherOptions, _catchers?: Map<number | string, (error: WretcherError, originalRequest: Wretcher) => void>, _resolvers?: Array<(resolver: ResponseChain, originalRequest: Wretcher) => any>, _middlewares?: ConfiguredMiddleware[], _deferredChain?: DeferredCallback[]);
    static factory(url?: string, options?: WretcherOptions): Wretcher;
    private selfFactory;
    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param options New default options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    defaults(options: WretcherOptions, mixin?: boolean): this;
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
    options(options: WretcherOptions, mixin?: boolean): Wretcher;
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
    query(qp: object | string, replace?: boolean): Wretcher;
    /**
     * Set request headers.
     * @param headerValues An object containing header keys and values
     */
    headers(headerValues: {
        [headerName: string]: string;
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
    catcher(errorId: number | string, catcher: (error: WretcherError, originalRequest: Wretcher) => any): Wretcher;
    /**
     * Associates a custom signal with the request.
     * @param controller : An AbortController
     */
    signal(controller: AbortController): Wretcher;
    /**
     * Program a resolver to perform response chain tasks automatically.
     * @param doResolve : Resolver callback
     */
    resolve(doResolve: (chain: ResponseChain, originalRequest: Wretcher) => ResponseChain | Promise<any>, clear?: boolean): Wretcher;
    /**
     * Defer wretcher methods that will be chained and called just before the request is performed.
     */
    defer(callback: DeferredCallback, clear?: boolean): Wretcher;
    /**
     * Add middlewares to intercept a request before being sent.
     */
    middlewares(middlewares: ConfiguredMiddleware[], clear?: boolean): Wretcher;
    private method;
    /**
     * Performs a get request.
     */
    get(options?: any): ResponseChain & Promise<any>;
    /**
     * Performs a delete request.
     */
    delete(options?: any): ResponseChain & Promise<any>;
    /**
     * Performs a put request.
     */
    put(body?: any, options?: any): ResponseChain & Promise<any>;
    /**
     * Performs a post request.
     */
    post(body?: any, options?: any): ResponseChain & Promise<any>;
    /**
     * Performs a patch request.
     */
    patch(body?: any, options?: any): ResponseChain & Promise<any>;
    /**
     * Performs a head request.
     */
    head(options?: any): ResponseChain & Promise<any>;
    /**
     * Performs an options request
     */
    opts(options?: any): ResponseChain & Promise<any>;
    /**
     * Replay a request.
     */
    replay(options?: any): ResponseChain & Promise<any>;
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
     * @param recursive If `true`, will recurse through all nested objects
     * Can be set as an array of string to exclude specific keys.
     * See https://github.com/elbywan/wretch/issues/68 for more details.
     */
    formData(formObject: object, recursive?: string[] | boolean): Wretcher;
    /**
     * Converts the input to an url encoded string and sets the content-type header and body.
     * If the input argument is already a string, skips the conversion part.
     *
     * @param input An object to convert into an url encoded string or an already encoded string
     */
    formUrl(input: (object | string)): Wretcher;
}
