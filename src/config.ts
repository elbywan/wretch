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
        PerformanceObserver: null,
        AbortController: null
    },
    polyfill(p: string, doThrow = true, instance = false, ...args) {
        const res = this.polyfills[p] ||
            (typeof self !== "undefined" ? self[p] : null) ||
            (typeof global !== "undefined" ? global[p] : null)
        if(doThrow && !res) throw new Error(p + " is not defined")
        return instance && res ? new res(...args) : res
    }
}

export default config
