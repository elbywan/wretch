declare const _default: (url?: string, opts?: {}) => Wretcher;
export default _default;
/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Almost every method of this class return a fresh Wretcher object.
 */
export declare class Wretcher {
    private _url;
    private _options;
    constructor(_url: string, _options?: {});
    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param opts New default options
     */
    defaults(opts: any): this;
    /**
     * Mixins the default fetch options used for every subsequent fetch calls.
     * @param opts Options to mixin with the current default options
     */
    mixdefaults(opts: any): this;
    /**
     * Sets the method (text, json ...) used to parse the data contained in the response body in case of an HTTP error.
     *
     * Persists for every subsequent requests.
     *
     * Default is "text".
     */
    errorType(method: any): this;
    /**
     * Returns a new Wretcher object with the url specified and the same options.
     * @param url String url
     */
    url(url: string): Wretcher;
    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     */
    options(options: Object): Wretcher;
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
    query(qp: Object): Wretcher;
    /**
     * Shortcut to set the "Accept" header.
     * @param what Header value
     */
    accept(what: string): Wretcher;
    /**
    * Performs a get request.
    */
    get(opts?: {}): {
        res: () => any;
        json: () => any;
        blob: () => any;
        formData: () => any;
        arrayBuffer: () => any;
        text: () => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: any) => any;
        unauthorized: (cb: any) => any;
        forbidden: (cb: any) => any;
        notFound: (cb: any) => any;
        timeout: (cb: any) => any;
        internalError: (cb: any) => any;
    };
    /**
    * Performs a delete request.
    */
    delete(opts?: {}): {
        res: () => any;
        json: () => any;
        blob: () => any;
        formData: () => any;
        arrayBuffer: () => any;
        text: () => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: any) => any;
        unauthorized: (cb: any) => any;
        forbidden: (cb: any) => any;
        notFound: (cb: any) => any;
        timeout: (cb: any) => any;
        internalError: (cb: any) => any;
    };
    /**
    * Performs a put request.
    */
    put(opts?: {}): {
        res: () => any;
        json: () => any;
        blob: () => any;
        formData: () => any;
        arrayBuffer: () => any;
        text: () => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: any) => any;
        unauthorized: (cb: any) => any;
        forbidden: (cb: any) => any;
        notFound: (cb: any) => any;
        timeout: (cb: any) => any;
        internalError: (cb: any) => any;
    };
    /**
    * Performs a post request.
    */
    post(opts?: {}): {
        res: () => any;
        json: () => any;
        blob: () => any;
        formData: () => any;
        arrayBuffer: () => any;
        text: () => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: any) => any;
        unauthorized: (cb: any) => any;
        forbidden: (cb: any) => any;
        notFound: (cb: any) => any;
        timeout: (cb: any) => any;
        internalError: (cb: any) => any;
    };
    /**
    * Performs a patch request.
    */
    patch(opts?: {}): {
        res: () => any;
        json: () => any;
        blob: () => any;
        formData: () => any;
        arrayBuffer: () => any;
        text: () => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: any) => any;
        unauthorized: (cb: any) => any;
        forbidden: (cb: any) => any;
        notFound: (cb: any) => any;
        timeout: (cb: any) => any;
        internalError: (cb: any) => any;
    };
    /**
     * Sets the content type header, stringifies an object and sets the request body.
     * @param obj An object
     */
    json(jsObject: any): Wretcher;
    /**
     * Converts the javascript object to a FormData and sets the request body.
     * @param obj An object
     */
    formData(obj: any): Wretcher;
}
