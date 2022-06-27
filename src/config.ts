import { mix } from "./utils.js"

declare const global

const config = {
  // Default options
  defaults: {},
  // Error type
  errorType: null,
  // Polyfills
  polyfills: {
    // fetch: null,
    // FormData: null,
    // URLSearchParams: null,
    // performance: null,
    // PerformanceObserver: null,
    // AbortController: null
  },
  polyfill(p: string, { doThrow = true, instance = false } = {}, ...args) {
    const res = this.polyfills[p] ||
      (typeof self !== "undefined" ? self[p] : null) ||
      (typeof global !== "undefined" ? global[p] : null)
    if (doThrow && !res) throw new Error(p + " is not defined")
    return instance && res ? new res(...args) : res
  }
}
export type Config = typeof config

/**
 * Sets the default fetch options used when creating a Wretch instance.
 * @param options New default options
 * @param replace If true, completely replaces the existing options instead of mixing in
 */
export function setDefaults(defaults: any, replace = false) {
  config.defaults = replace ? defaults : mix(config.defaults, defaults)
}

/**
 * Sets the global polyfills which will be used for every subsequent calls.
 *
 * Needed for libraries like [fetch-ponyfill](https://github.com/qubyte/fetch-ponyfill).
 *
 * @param polyfills An object containing the polyfills
 * @param replace If true, replaces the current polyfills instead of mixing in
 */
export function setPolyfills(polyfills: any, replace = false) {
  config.polyfills = replace ? polyfills : mix(config.polyfills, polyfills)
}

/**
 * Sets the default method (text, json ...) used to parse the data contained in the response body in case of an HTTP error.
 *
 * If null, defaults to "text".
 */
export function setErrorType(errorType: string) {
  config.errorType = errorType
}

export default config
