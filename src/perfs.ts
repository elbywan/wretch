import conf from "./config"

const onMatch = (entries, name, callback, _performance) => {
    const matches = entries.getEntriesByName(name)
    if(matches && matches.length > 0) {
        callback(matches.reverse()[0])
        _performance.clearMeasures(name)
        perfs.callbacks.delete(name)

        if(perfs.callbacks.size < 1) {
            perfs.observer.disconnect()
            if(_performance.clearResourceTimings) {
                _performance.clearResourceTimings()
            }
        }
        return true
    }
    return false
}

const lazyObserver = (_performance, _observer) => {
    if(!perfs.observer && _performance && _observer) {
        perfs.observer = new _observer(entries => {
            perfs.callbacks.forEach((callback, name) => {
                onMatch(entries, name, callback, _performance)
            })
        })
        if(_performance.clearResourceTimings) _performance.clearResourceTimings()
    }
    return perfs.observer
}

const perfs = {
    callbacks: new Map(),
    observer: null,
    observe: (name, callback) => {
        if(!name || !callback)
            return

        const _performance = conf.polyfills.performance || (typeof self !== "undefined" ? self["performance"] : null)
        const _observer  = conf.polyfills.PerformanceObserver || (typeof self !== "undefined" ? self["PerformanceObserver"] : null)

        if(!lazyObserver(_performance, _observer))
            return

        if(!onMatch(_performance, name, callback, _performance)) {
            if(perfs.callbacks.size < 1)
                perfs.observer.observe({ entryTypes: ["resource", "measure"] })
            perfs.callbacks.set(name, callback)
        }

    }
}

export default perfs
