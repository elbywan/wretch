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
        PerformanceObserver: null,
        AbortController: null
    },
    polyfill: function (p, doThrow, instance) {
        if (doThrow === void 0) { doThrow = true; }
        if (instance === void 0) { instance = false; }
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var res = this.polyfills[p] ||
            (typeof self !== "undefined" ? self[p] : null) ||
            (typeof global !== "undefined" ? global[p] : null);
        if (doThrow && !res)
            throw new Error(p + " is not defined");
        return instance && res ? new (res.bind.apply(res, [void 0].concat(args)))() : res;
    }
};
export default config;
//# sourceMappingURL=config.js.map