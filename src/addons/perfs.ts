import type { WretchResponseChain } from "../resolver"
import type { WretchAddon } from "../types"

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

    const _performance = config.polyfill("performance", { doThrow: false })
    const _observer = config.polyfill("PerformanceObserver", { doThrow: false })

    if (!lazyObserver(_performance, _observer))
      return

    if (!onMatch(_performance, name, callback, _performance)) {
      if (utils.callbacks.size < 1)
        utils.observer.observe({ entryTypes: ["resource", "measure"] })
      utils.callbacks.set(name, callback)
    }

  }
}

interface Perfs {
  /**
   * Performs a callback on the API performance timings of the request.
   *
   * Warning: Still experimental on browsers and node.js
   */
  perfs: <T, C extends Perfs>(this: C & WretchResponseChain<T, C>, cb?: (timing: any) => void) => this,
}

/**
 * Adds the ability to measure requests using the Performance Timings API.
 *
 * ```js
 * import PerfsAddon from "wretch/addons/perfs"
 *
 * wretch().addon(PerfsAddon())
 * ```
 */
const perfs: () => WretchAddon<unknown, Perfs> = () => ({
  resolver: {
    perfs(cb) {
      this.fetchRequest.then(res => utils.observe(res.url, cb, this.wretchRequest._config)).catch(() => {/* swallow */ })
      return this
    },
  }
})

export default perfs