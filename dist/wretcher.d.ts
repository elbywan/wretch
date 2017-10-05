import conf from "./config";
import { WretcherError } from "./resolver";
/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
export declare class Wretcher {
    private _url;
    private _options;
    private _catchers;
    protected constructor(_url: string, _options?: RequestInit, _catchers?: Map<number, (error: WretcherError) => void>);
    static factory(url?: string, opts?: RequestInit): Wretcher;
    private selfFactory({url, options, catchers}?);
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
     * Returns a new Wretcher object with the url specified and the same options.
     * @param url String url
     */
    url(url: string): Wretcher;
    /**
     * Returns a wretch factory which, when called, creates a new Wretcher object with the base url as an url prefix.
     * @param baseurl The base url
     */
    baseUrl(baseurl: string): (url?: string, opts?: RequestInit) => Wretcher;
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
     * Adds a default catcher which will be called on every subsequent request error when the error code matches.
     * @param code Error code
     * @param catcher: The catcher method
     */
    catcher(code: number, catcher: (error: WretcherError) => void): Wretcher;
    /**
     * Performs a get request.
     */
    get(opts?: {}): {
        res: <Result = Response>(cb?: (type: Response) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        perfs: (cb?: (type: any) => void) => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: WretcherError) => void) => any;
        unauthorized: (cb: (error: WretcherError) => void) => any;
        forbidden: (cb: (error: WretcherError) => void) => any;
        notFound: (cb: (error: WretcherError) => void) => any;
        timeout: (cb: (error: WretcherError) => void) => any;
        internalError: (cb: (error: WretcherError) => void) => any;
    };
    /**
     * Performs a delete request.
     */
    delete(opts?: {}): {
        res: <Result = Response>(cb?: (type: Response) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        perfs: (cb?: (type: any) => void) => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: WretcherError) => void) => any;
        unauthorized: (cb: (error: WretcherError) => void) => any;
        forbidden: (cb: (error: WretcherError) => void) => any;
        notFound: (cb: (error: WretcherError) => void) => any;
        timeout: (cb: (error: WretcherError) => void) => any;
        internalError: (cb: (error: WretcherError) => void) => any;
    };
    /**
     * Performs a put request.
     */
    put(opts?: {}): {
        res: <Result = Response>(cb?: (type: Response) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        perfs: (cb?: (type: any) => void) => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: WretcherError) => void) => any;
        unauthorized: (cb: (error: WretcherError) => void) => any;
        forbidden: (cb: (error: WretcherError) => void) => any;
        notFound: (cb: (error: WretcherError) => void) => any;
        timeout: (cb: (error: WretcherError) => void) => any;
        internalError: (cb: (error: WretcherError) => void) => any;
    };
    /**
     * Performs a post request.
     */
    post(opts?: {}): {
        res: <Result = Response>(cb?: (type: Response) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        perfs: (cb?: (type: any) => void) => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: WretcherError) => void) => any;
        unauthorized: (cb: (error: WretcherError) => void) => any;
        forbidden: (cb: (error: WretcherError) => void) => any;
        notFound: (cb: (error: WretcherError) => void) => any;
        timeout: (cb: (error: WretcherError) => void) => any;
        internalError: (cb: (error: WretcherError) => void) => any;
    };
    /**
     * Performs a patch request.
     */
    patch(opts?: {}): {
        res: <Result = Response>(cb?: (type: Response) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        perfs: (cb?: (type: any) => void) => any;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: WretcherError) => void) => any;
        unauthorized: (cb: (error: WretcherError) => void) => any;
        forbidden: (cb: (error: WretcherError) => void) => any;
        notFound: (cb: (error: WretcherError) => void) => any;
        timeout: (cb: (error: WretcherError) => void) => any;
        internalError: (cb: (error: WretcherError) => void) => any;
    };
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
}
