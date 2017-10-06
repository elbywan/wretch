declare const global

const config = {
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
    polyfill(p: string, doThrow = true) {
        const res = this.polyfills[p] ||
            (typeof self !== "undefined" ? self[p] : null) ||
            (typeof global !== "undefined" ? global[p] : null)
        if(doThrow && !res) throw new Error(p + " is not defined")
        return res
    }
}

export default config
