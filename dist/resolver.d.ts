import { Wretcher } from "./wretcher";
export declare type WretcherError = Error & {
    status: number;
    response: WretcherResponse;
    text?: string;
    json?: any;
};
export declare type WretcherResponse = Response & {
    [key: string]: any;
};
export declare type ResponseChain = {
    res: <Result = WretcherResponse>(cb?: (type: WretcherResponse) => Result) => Promise<Result>;
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
    badRequest: (cb: (error: WretcherError, originalRequest: Wretcher) => void) => ResponseChain;
    unauthorized: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain;
    forbidden: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain;
    notFound: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain;
    timeout: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain;
    internalError: (cb: (error: WretcherError, originalRequest: Wretcher) => any) => ResponseChain;
    onAbort: (cb: (error: Error, originalRequest: Wretcher) => any) => ResponseChain;
};
export declare const resolver: (wretcher: Wretcher) => ResponseChain & Promise<any>;
