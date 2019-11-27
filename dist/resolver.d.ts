import { Wretcher } from "./wretcher";
export declare type WretcherError = Error & {
    status: number;
    response: WretcherResponse;
    text?: string;
    json?: any;
};
export declare type WretcherErrorCallback = (error: WretcherError, originalRequest: Wretcher) => any;
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
    perfs: (cb?: (timing: any) => void) => ResponseChain;
    setTimeout: (time: number, controller?: AbortController) => ResponseChain;
    controller: () => [any, ResponseChain];
    error: (code: (number | string), cb: WretcherErrorCallback) => ResponseChain;
    badRequest: (cb: WretcherErrorCallback) => ResponseChain;
    unauthorized: (cb: WretcherErrorCallback) => ResponseChain;
    forbidden: (cb: WretcherErrorCallback) => ResponseChain;
    notFound: (cb: WretcherErrorCallback) => ResponseChain;
    timeout: (cb: WretcherErrorCallback) => ResponseChain;
    internalError: (cb: WretcherErrorCallback) => ResponseChain;
    fetchError: (cb: WretcherErrorCallback) => ResponseChain;
    onAbort: (cb: WretcherErrorCallback) => ResponseChain;
};
export declare const resolver: (wretcher: Wretcher) => ResponseChain & Promise<any>;
