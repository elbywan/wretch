var config = {
    // Default options
    defaults: {},
    // Error type
    errorType: null,
    // Polyfills
    polyfills: {
        fetch: null,
        FormData: null,
        URLSearchParams: null,
        performance: null,
        PerformanceObserver: null
    },
    polyfill: function (p, doThrow) {
        if (doThrow === void 0) { doThrow = true; }
        var res = this.polyfills[p] ||
            (typeof self !== "undefined" ? self[p] : null) ||
            (typeof global !== "undefined" ? global[p] : null);
        if (doThrow && !res)
            throw new Error(p + " is not defined");
        return res;
    }
};
export default config;
//# sourceMappingURL=config.js.map