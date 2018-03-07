declare const config: {
    defaults: {};
    errorType: any;
    polyfills: {
        fetch: any;
        FormData: any;
        URLSearchParams: any;
        performance: any;
        PerformanceObserver: any;
        AbortController: any;
    };
    polyfill(p: string, { doThrow, instance }?: {
        doThrow?: boolean;
        instance?: boolean;
    }, ...args: any[]): any;
};
export default config;
