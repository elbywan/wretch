import type { Wretch, WretchAddon, WretchErrorCallback, WretchResponseChain } from "../types.js"

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
  signal: <T extends AbortWretch, C, R, E>(this: T & Wretch<T, C, R, E>, controller: AbortController) => this
}

/**
 * Options for the setTimeout method.
 */
export type SetTimeoutOptions = {
  /**
   * A custom AbortController to use for aborting the request.
   * If not provided, the controller associated with the request will be used.
   */
  controller?: AbortController
}

export interface AbortResolver {
  /**
   * Aborts the request after a fixed time.
   *
   * If you use a custom AbortController associated with the request, pass it in the options object.
   *
   * ```js
   * // 1 second timeout
   * wretch("...").addon(AbortAddon()).get().setTimeout(1000).json(_ =>
   *   // will not be called if the request timeouts
   * )
   *
   * // With custom controller
   * wretch("...").addon(AbortAddon()).get().setTimeout(1000, { controller }).json()
   * ```
   *
   * @param time - Time in milliseconds
   * @param options - Optional configuration object
   */
  setTimeout: <T, C extends AbortResolver, R, E>(this: C & WretchResponseChain<T, C, R, E>, time: number, options?: SetTimeoutOptions) => this
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
  controller: <T, C extends AbortResolver, R, E>(this: C & WretchResponseChain<T, C, R, E>) => [any, this]
  /**
   * Catches an AbortError and performs a callback.
   */
  onAbort: <T, C extends AbortResolver, R, E>(this: C & WretchResponseChain<T, C, R, E>, cb: WretchErrorCallback<T, C, R, E>) => this
}

/**
 * Adds the ability to abort requests using AbortController and signals under the hood.
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
  return {
    beforeRequest(wretch, options, state) {
      const fetchController = new AbortController()
      if (!options["signal"]) {
        options["signal"] = fetchController.signal
      }
      const timeout = {
        ref: null,
        clear() {
          if (timeout.ref) {
            clearTimeout(timeout.ref)
            timeout.ref = null
          }
        }
      }
      state.abort = {
        timeout,
        fetchController
      }
      return wretch
    },
    wretch: {
      signal(controller) {
        return { ...this, _options: { ...this._options, signal: controller.signal } }
      },
    },
    resolver: {
      setTimeout(time, options = {}) {
        const controller = options.controller ?? this._sharedState.abort.fetchController
        const { timeout } = this._sharedState.abort
        timeout.clear()
        timeout.ref = setTimeout(() => controller.abort(), time)
        return this
      },
      controller() { return [this._sharedState.abort.fetchController, this] },
      onAbort(cb) { return this.error("AbortError", cb) }
    },
  }
}

export default abort
