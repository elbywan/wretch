import conf from "./config";
var onMatch = function (entries, name, callback, _performance) {
    if (!entries.getEntriesByName)
        return false;
    var matches = entries.getEntriesByName(name);
    if (matches && matches.length > 0) {
        callback(matches.reverse()[0]);
        if (_performance.clearMeasures)
            _performance.clearMeasures(name);
        perfs.callbacks.delete(name);
        if (perfs.callbacks.size < 1) {
            perfs.observer.disconnect();
            if (_performance.clearResourceTimings) {
                _performance.clearResourceTimings();
            }
        }
        return true;
    }
    return false;
};
var lazyObserver = function (_performance, _observer) {
    if (!perfs.observer && _performance && _observer) {
        perfs.observer = new _observer(function (entries) {
            perfs.callbacks.forEach(function (callback, name) {
                onMatch(entries, name, callback, _performance);
            });
        });
        if (_performance.clearResourceTimings)
            _performance.clearResourceTimings();
    }
    return perfs.observer;
};
var perfs = {
    callbacks: new Map(),
    observer: null,
    observe: function (name, callback) {
        if (!name || !callback)
            return;
        var _performance = conf.polyfill("performance", { doThrow: false });
        var _observer = conf.polyfill("PerformanceObserver", { doThrow: false });
        if (!lazyObserver(_performance, _observer))
            return;
        if (!onMatch(_performance, name, callback, _performance)) {
            if (perfs.callbacks.size < 1)
                perfs.observer.observe({ entryTypes: ["resource", "measure"] });
            perfs.callbacks.set(name, callback);
        }
    }
};
export default perfs;
//# sourceMappingURL=perfs.js.map