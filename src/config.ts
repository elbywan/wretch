import { mix } from "./utils.js"
import type { Config, ErrorType, WretchOptions } from "./types.js"

const config: Config = {
  // Default options
  options: {},
  // Error type
  errorType: "text",
}

/**
 * Sets the default fetch options that will be stored internally when instantiating wretch objects.
 *
 * ```js
 * import wretch from "wretch"
 *
 * wretch.options({ headers: { "Accept": "application/json" } });
 *
 * // The fetch request is sent with both headers.
 * wretch("...", { headers: { "X-Custom": "Header" } }).get().res();
 * ```
 *
 * @param options Default options
 * @param replace If true, completely replaces the existing options instead of mixing in
 */
export function setOptions(options: WretchOptions, replace = false) {
  config.options = replace ? options : mix(config.options, options)
}

/**
 * Sets a custom fetch implementation globally.
 * This will affect all wretch instances created after this call.
 *
 * Useful for:
 * - Using a custom fetch polyfill
 * - Adding global middleware to all requests
 * - Mocking fetch globally in tests
 *
 * ```js
 * import wretch from "wretch"
 *
 * // Set a custom fetch implementation globally
 * wretch.fetchPolyfill((url, opts) => {
 *   console.log('Fetching:', url)
 *   return fetch(url, opts)
 * })
 *
 * // All subsequent requests will use the custom fetch
 * wretch("...").get().res()
 * ```
 *
 * @param fetchImpl - A custom fetch implementation
 */
export function setFetchPolyfill(fetchImpl: (url: string, opts: WretchOptions) => Promise<Response>) {
  config.fetch = fetchImpl
}

/**
 * Sets the default method (text, json, …) used to parse the data contained in the response body in case of an HTTP error.
 * As with other static methods, it will affect wretch instances created after calling this function.
 *
 * _Note: if the response Content-Type header is set to "application/json", the body will be parsed as json regardless of the errorType._
 *
 * ```js
 * import wretch from "wretch"
 *
 * wretch.errorType("json")
 *
 * wretch("http://server/which/returns/an/error/with/a/json/body")
 *   .get()
 *   .res()
 *   .catch(error => {
 *     // error[errorType] (here, json) contains the parsed body
 *     console.log(error.json)
 *   })
 * ```
 *
 * If null, defaults to "text".
 */
export function setErrorType(errorType: ErrorType) {
  config.errorType = errorType
}

export default config
