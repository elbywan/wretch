import type { Wretch, WretchAddon, WretchErrorCallback, WretchResponseChain } from "../types"

export interface AbortWretch {
  /**
   * Associates a custom controller with the request.
   *
   * Useful when you need to use
   * your own AbortController, otherwise wretch will create a new controller itself.
   *
   * ```js
   * const controller = new AbortController()
   *
   * // Associates the same controller with multiple requests
   * wretch("url1")
   *   .addon(AbortAddon())
   *   .signal(controller)
   *   .get()
   *   .json()
   * wretch("url2")
   *   .addon(AbortAddon())
   *   .signal(controller)
   *   .get()
   *   .json()
   *
   * // Aborts both requests
   * controller.abort()
   * ```
   *
   * @param controller - An instance of AbortController
   */
  signal: <T extends AbortWretch, C>(this: T & Wretch<T, C>, controller: AbortController) => this
}

export interface AbortResolver {
  /**
   * Aborts the request after a fixed time.
   *
   * If you use a custom AbortController associated with the request, pass it as the second argument.
   *
   * ```js
   * // 1 second timeout
   * wretch("...").addon(AbortAddon()).get().setTimeout(1000).json(_ =>
   *   // will not be called if the request timeouts
   * )
   * ```
   *
   * @param time - Time in milliseconds
   * @param controller - An instance of AbortController
   */
  setTimeout: <T, C extends AbortResolver>(this: C & WretchResponseChain<T, C>, time: number, controller?: AbortController) => this
  /**
   * Returns the provided or generated AbortController plus the wretch response chain as a pair.
   *
   * ```js
   * // We need the controller outside the chain
   * const [c, w] = wretch("url")
   *   .addon(AbortAddon())
   *   .get()
   *   .controller()
   *
   * // Resume with the chain
   * w.onAbort(_ => console.log("ouch")).json()
   *
   * // Later on…
   * c.abort()
   * ```
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
 *
 * _Only compatible with browsers that support
 * [AbortControllers](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * Otherwise, you could use a (partial)
 * [polyfill](https://www.npmjs.com/package/abortcontroller-polyfill)._
 *
 * ```js
 * import AbortAddon from "wretch/addons/abort"
 *
 * const [c, w] = wretch("...")
 *   .addon(AbortAddon())
 *   .get()
 *   .onAbort((_) => console.log("Aborted !"))
 *   .controller();
 *
 * w.text((_) => console.log("should never be called"));
 * c.abort();
 *
 * // Or :
 *
 * const controller = new AbortController();
 *
 * wretch("...")
 *   .addon(AbortAddon())
 *   .signal(controller)
 *   .get()
 *   .onAbort((_) => console.log("Aborted !"))
 *   .text((_) => console.log("should never be called"));
 *
 * controller.abort();
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
