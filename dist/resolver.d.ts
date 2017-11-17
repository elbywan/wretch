import { ConfiguredMiddleware } from "./middleware";
export declare type WretcherError = Error & {
    status: number;
    response: Response;
    text?: string;
    json?: any;
};
export declare type ResponseChain = {
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
    perfs: (cb?: (type: any) => void) => ResponseChain;
    setTimeout: (time: number, controller?: any) => ResponseChain;
    controller: () => [any, ResponseChain];
    error: (code: (number | string), cb: any) => ResponseChain;
    badRequest: (cb: (error: WretcherError) => void) => ResponseChain;
    unauthorized: (cb: (error: WretcherError) => void) => ResponseChain;
    forbidden: (cb: (error: WretcherError) => void) => ResponseChain;
    notFound: (cb: (error: WretcherError) => void) => ResponseChain;
    timeout: (cb: (error: WretcherError) => void) => ResponseChain;
    internalError: (cb: (error: WretcherError) => void) => ResponseChain;
    onAbort: (cb: (error: Error) => void) => ResponseChain;
};
export declare const resolver: (url: any) => (catchers?: Map<string | number, (error: WretcherError) => void>) => (resolvers: ((chain: ResponseChain) => ResponseChain & Promise<any>)[]) => (middlewares: ConfiguredMiddleware[]) => (opts?: {}) => ResponseChain & Promise<any>;
