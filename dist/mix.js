var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
export var mix = function (one, two, mergeArrays) {
    if (mergeArrays === void 0) { mergeArrays = false; }
    if (!one || !two || typeof one !== "object" || typeof two !== "object")
        return one;
    var clone = __assign({}, one, two);
    for (var prop in two) {
        if (two.hasOwnProperty(prop)) {
            if (two[prop] instanceof Array && one[prop] instanceof Array) {
                clone[prop] = mergeArrays ? one[prop].concat(two[prop]) : clone[prop] = two[prop];
            }
            else if (typeof two[prop] === "object" && typeof one[prop] === "object") {
                clone[prop] = mix(one[prop], two[prop], mergeArrays);
            }
        }
    }
    return clone;
};
//# sourceMappingURL=mix.js.map