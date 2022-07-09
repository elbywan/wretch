import type { WretchResponseChain, WretchAddon } from "../types.js"

const onMatch = (entries, name, callback, _performance) => {
  if (!entries.getEntriesByName)
    return false
  const matches = entries.getEntriesByName(name)
  if (matches && matches.length > 0) {
    callback(matches.reverse()[0])
    if (_performance.clearMeasures)
      _performance.clearMeasures(name)
    utils.callbacks.delete(name)

    if (utils.callbacks.size < 1) {
      utils.observer.disconnect()
      if (_performance.clearResourceTimings) {
        _performance.clearResourceTimings()
      }
    }
    return true
  }
  return false
}

const lazyObserver = (_performance, _observer) => {
  if (!utils.observer && _performance && _observer) {
    utils.observer = new _observer(entries => {
      utils.callbacks.forEach((callback, name) => {
        onMatch(entries, name, callback, _performance)
      })
    })
    if (_performance.clearResourceTimings)
      _performance.clearResourceTimings()
  }
  return utils.observer
}

const utils = {
  callbacks: new Map(),
  observer: null,
  observe: (name, callback, config) => {
    if (!name || !callback)
      return

    const _performance = config.polyfill("performance", false)
    const _observer = config.polyfill("PerformanceObserver", false)

    if (!lazyObserver(_performance, _observer))
      return

    if (!onMatch(_performance, name, callback, _performance)) {
      if (utils.callbacks.size < 1)
        utils.observer.observe({ entryTypes: ["resource", "measure"] })
      utils.callbacks.set(name, callback)
    }

  }
}

export interface PerfsAddon {
  /**
   * Performs a callback on the API performance timings of the request.
   *
   * Warning: Still experimental on browsers and node.js
   */
  perfs: <T, C extends PerfsAddon, R>(this: C & WretchResponseChain<T, C, R>, cb?: (timing: any) => void) => this,
}

/**
 * Adds the ability to measure requests using the Performance Timings API.
 *
 * Uses the Performance API
 * ([browsers](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API) &
 * [node.js](https://nodejs.org/api/perf_hooks.html)) to expose timings related to
 * the underlying request.
 *
 * Browser timings are very accurate, node.js only contains raw measures.
 *
 * ```js
 * import PerfsAddon from "wretch/addons/perfs"
 *
 * // Use perfs() before the response types (text, json, ...)
 * wretch("...")
 *   .addon(PerfsAddon())
 *   .get()
 *   .perfs((timings) => {
 *     // Will be called when the timings are ready.
 * console.log(timings.startTime);
 *   })
 *   .res();
 *
 * ```
 *
 * For node.js, there is a little extra work to do :
 *
 * ```js
 * // Node.js only
 * const { performance, PerformanceObserver } = require("perf_hooks");
 *
 * wretch.polyfills({
 *   fetch: function (url, opts) {
 *     performance.mark(url + " - begin");
 *     return fetch(url, opts).then(res => {
 *       performance.mark(url + " - end");
 *       setTimeout(() => performance.measure(res.url, url + " - begin", url + " - end"), 0);
 *       return res;
 *     });
 *   },
 *   // other polyfills…
 *   performance: performance,
 *   PerformanceObserver: PerformanceObserver,
 * });
 * ```
 */
const perfs: () => WretchAddon<unknown, PerfsAddon> = () => ({
  resolver: {
    perfs(cb) {
      this._fetchReq.then(res => utils.observe(res.url, cb, this._wretchReq._config)).catch(() => {/* swallow */ })
      return this
    },
  }
})

export default perfs
