export declare type WretcherError = Error & {
    status: number;
    response: Response;
    text?: string;
    json?: any;
};
export declare const resolver: (url: any) => (catchers?: Map<string | number, (error: WretcherError) => void>) => (opts?: {}) => {
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
    setTimeout: (time: number, controller: any) => any;
    controller: () => [any, any];
    error: (code: string | number, cb: any) => any;
    badRequest: (cb: (error: WretcherError) => void) => any;
    unauthorized: (cb: (error: WretcherError) => void) => any;
    forbidden: (cb: (error: WretcherError) => void) => any;
    notFound: (cb: (error: WretcherError) => void) => any;
    timeout: (cb: (error: WretcherError) => void) => any;
    internalError: (cb: (error: WretcherError) => void) => any;
    onAbort: (cb: (error: Error) => void) => any;
};
