/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
export declare class Wretcher {
    private _url;
    private _options;
    constructor(_url: string, _options?: {});
    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param opts New default options
     */
    defaults(opts: object): this;
    /**
     * Mixins the default fetch options used for every subsequent fetch calls.
     * @param opts Options to mixin with the current default options
     */
    mixdefaults(opts: object): this;
    /**
     * Sets the method (text, json ...) used to parse the data contained in the response body in case of an HTTP error.
     *
     * Persists for every subsequent requests.
     *
     * Default is "text".
     */
    errorType(method: "text" | "json"): this;
    /**
     * Returns a new Wretcher object with the url specified and the same options.
     * @param url String url
     */
    url(url: string): Wretcher;
    /**
     * Returns a wretch factory which, when called, creates a new Wretcher object with the base url as an url prefix.
     * @param baseurl The base url
     */
    baseUrl(baseurl: string): (url?: string, opts?: {}) => Wretcher;
    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     */
    options(options: object): Wretcher;
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
     * Shortcut to set the "Accept" header.
     * @param what Header value
     */
    accept(what: string): Wretcher;
    /**
     * Performs a get request.
     */
    get(opts?: {}): {
        res: <Result = Response>(cb?: (type: void) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        unauthorized: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        forbidden: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        notFound: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        timeout: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        internalError: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
    };
    /**
     * Performs a delete request.
     */
    delete(opts?: {}): {
        res: <Result = Response>(cb?: (type: void) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        unauthorized: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        forbidden: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        notFound: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        timeout: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        internalError: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
    };
    /**
     * Performs a put request.
     */
    put(opts?: {}): {
        res: <Result = Response>(cb?: (type: void) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        unauthorized: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        forbidden: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        notFound: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        timeout: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        internalError: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
    };
    /**
     * Performs a post request.
     */
    post(opts?: {}): {
        res: <Result = Response>(cb?: (type: void) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        unauthorized: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        forbidden: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        notFound: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        timeout: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        internalError: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
    };
    /**
     * Performs a patch request.
     */
    patch(opts?: {}): {
        res: <Result = Response>(cb?: (type: void) => Result) => Promise<Result>;
        json: <Result = {
            [key: string]: any;
        }>(cb?: (type: {
            [key: string]: any;
        }) => Result) => Promise<Result>;
        blob: <Result = Blob>(cb?: (type: Blob) => Result) => Promise<Result>;
        formData: <Result = FormData>(cb?: (type: FormData) => Result) => Promise<Result>;
        arrayBuffer: <Result = ArrayBuffer>(cb?: (type: ArrayBuffer) => Result) => Promise<Result>;
        text: <Result = string>(cb?: (type: string) => Result) => Promise<Result>;
        error: (code: number, cb: any) => any;
        badRequest: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        unauthorized: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        forbidden: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        notFound: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        timeout: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
        internalError: (cb: (error: Error & {
            status: number;
            response: Response;
            text?: string;
            json?: any;
        }) => void) => any;
    };
    /**
     * Sets the content type header, stringifies an object and sets the request body.
     * @param jsObject An object
     */
    json(jsObject: object): Wretcher;
    /**
     * Converts the javascript object to a FormData and sets the request body.
     * @param formObject An object
     */
    formData(formObject: object): Wretcher;
}
