var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
export var mix = function (one, two, mergeArrays) {
    if (mergeArrays === void 0) { mergeArrays = false; }
    if (!one || !two || typeof one !== "object" || typeof two !== "object")
        return one;
    var clone = __assign({}, one);
    for (var prop in two) {
        if (two.hasOwnProperty(prop)) {
            if (two[prop] instanceof Array && one[prop] instanceof Array) {
                clone[prop] = mergeArrays ? __spreadArrays(one[prop], two[prop]) : two[prop];
            }
            else if (typeof two[prop] === "object" && typeof one[prop] === "object") {
                clone[prop] = mix(one[prop], two[prop], mergeArrays);
            }
            else {
                clone[prop] = two[prop];
            }
        }
    }
    return clone;
};
//# sourceMappingURL=mix.js.map