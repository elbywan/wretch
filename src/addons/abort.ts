import type { WretchResponseChain } from "../resolver.js"
import type { Wretch, WretchAddon, WretchErrorCallback } from "../types.js"

export interface AbortWretch {
  /**
   * Associates a custom signal with the request.
   * @param controller - An AbortController
   */
  signal: <T extends AbortWretch, C>(this: T & Wretch<T, C>, controller: AbortController) => this
}

export interface AbortResolver {
  /**
   * Aborts the request after a fixed time.
   *
   * @param time - Time in milliseconds
   * @param controller - A custom controller
   */
  setTimeout: <T, C extends AbortResolver>(this: C & WretchResponseChain<T, C>, time: number, controller?: AbortController) => this
  /**
   * Returns the automatically generated AbortController alongside the current wretch response as a pair.
   */
  controller: <T, C extends AbortResolver>(this: C & WretchResponseChain<T, C>) => [any, this]
  /**
   * Catches an AbortError and performs a callback.
   */
  onAbort: <T, C extends AbortResolver>(this: C & WretchResponseChain<T, C>, cb: WretchErrorCallback<T, C>) => this
}

/**
 * Adds the ability to abort requests using AbortController and signals under the hood.
 *
 * ```js
 * import AbortAddon from "wetch/addons/abort"
 *
 * wretch().addon(AbortAddon())
 * ```
 */
const abort: () => WretchAddon<AbortWretch, AbortResolver> = () => {
  let timeout = null
  let fetchController = null
  return {
    beforeRequest(wretch, options) {
      fetchController = wretch._config.polyfill("AbortController", false, true)
      if (!options["signal"] && fetchController) {
        options["signal"] = fetchController.signal
      }
      timeout = {
        ref: null,
        clear() {
          if (timeout.ref) {
            clearTimeout(timeout.ref)
            timeout.ref = null
          }
        }
      }
    },
    wretch: {
      signal(controller) {
        return { ...this, _options: { ...this._options, signal: controller.signal } }
      },
    },
    resolver: {
      setTimeout(time, controller = fetchController) {
        timeout.clear()
        timeout.ref = setTimeout(() => controller.abort(), time)
        return this
      },
      controller() { return [fetchController, this] },
      onAbort(cb) { return this.error("AbortError", cb) }
    },
  }
}

export default abort