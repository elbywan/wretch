import { setOptions, setErrorType, setPolyfills } from "./config.js"
import { core } from "./core.js"
import type { Wretch } from "./types"

export type {
  Wretch,
  Config,
  ConfiguredMiddleware,
  FetchLike,
  Middleware,
  WretchResponseChain,
  WretchOptions,
  WretchError,
  WretchErrorCallback,
  WretchResponse,
  WretchDeferredCallback,
} from "./types"

/**
 * Creates a new wretch instance with a base url and base
 * [fetch options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).
 *
 * ```ts
 * import wretch from "wretch"
 *
 * // Reusable instance
 * const w = wretch("https://domain.com", { mode: "cors" })
 * ```
 *
 * @param _url The base url
 * @param _options The base fetch options
 * @returns A fresh wretch instance
 */
function factory(_url = "", _options = {}): Wretch {
  return { ...core, _url, _options }
}

factory["default"] = factory
/** {@inheritDoc setOptions} */
factory.options = setOptions
/** {@inheritDoc setErrorType} */
factory.errorType = setErrorType
/** {@inheritDoc setPolyfills} */
factory.polyfills = setPolyfills
export default factory
