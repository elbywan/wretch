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
    polyfill: function (p, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.doThrow, doThrow = _c === void 0 ? true : _c, _d = _b.instance, instance = _d === void 0 ? false : _d;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
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