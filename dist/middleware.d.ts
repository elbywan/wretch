export declare type Middleware = (options?: {
    [key: string]: any;
}) => ConfiguredMiddleware;
export declare type ConfiguredMiddleware = (next: FetchLike) => FetchLike;
export declare type FetchLike = (url: string, opts: RequestInit) => Promise<Response>;
export declare const middlewareHelper: (middlewares: ConfiguredMiddleware[]) => (fetchFunction: FetchLike) => FetchLike;
