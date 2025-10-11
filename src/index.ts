import { setOptions, setFetchPolyfill } from "./config.js"
import { core } from "./core.js"
import { WretchError } from "./resolver.js"
import type { Wretch, WretchOptions } from "./types.js"

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
  WretchAddon
} from "./types.js"

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
function factory(_url = "", _options: WretchOptions = {}): Wretch {
  return { ...core, _url, _options }
}

factory["default"] = factory
factory.options = setOptions
factory.fetchPolyfill = setFetchPolyfill
factory.WretchError = WretchError

export default factory
