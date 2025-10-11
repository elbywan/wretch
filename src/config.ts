import { mix } from "./utils.js"
import type { Config, WretchOptions } from "./types.js"

const config: Config = {
  options: {},
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



export default config
