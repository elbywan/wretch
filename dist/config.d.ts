declare const config: {
    defaults: {};
    errorType: any;
    polyfills: {
        fetch: any;
        FormData: any;
        URLSearchParams: any;
        performance: any;
        PerformanceObserver: any;
    };
    polyfill(p: string, doThrow?: boolean): any;
};
export default config;
