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
import { mix } from "./mix";
import conf from "./config";
import { resolver } from "./resolver";
var JSON_MIME = "application/json";
var CONTENT_TYPE_HEADER = "Content-Type";
/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
var Wretcher = /** @class */ (function () {
    function Wretcher(_url, _options, _catchers, _resolvers, _middlewares, _deferredChain) {
        if (_catchers === void 0) { _catchers = new Map(); }
        if (_resolvers === void 0) { _resolvers = []; }
        if (_middlewares === void 0) { _middlewares = []; }
        if (_deferredChain === void 0) { _deferredChain = []; }
        this._url = _url;
        this._options = _options;
        this._catchers = _catchers;
        this._resolvers = _resolvers;
        this._middlewares = _middlewares;
        this._deferredChain = _deferredChain;
    }
    Wretcher.factory = function (url, options) {
        if (url === void 0) { url = ""; }
        if (options === void 0) { options = {}; }
        return new Wretcher(url, options);
    };
    Wretcher.prototype.selfFactory = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.url, url = _c === void 0 ? this._url : _c, _d = _b.options, options = _d === void 0 ? this._options : _d, _e = _b.catchers, catchers = _e === void 0 ? this._catchers : _e, _f = _b.resolvers, resolvers = _f === void 0 ? this._resolvers : _f, _g = _b.middlewares, middlewares = _g === void 0 ? this._middlewares : _g, _h = _b.deferredChain, deferredChain = _h === void 0 ? this._deferredChain : _h;
        return new Wretcher(url, __assign({}, options), new Map(catchers), __spreadArrays(resolvers), __spreadArrays(middlewares), __spreadArrays(deferredChain));
    };
    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param options New default options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    Wretcher.prototype.defaults = function (options, mixin) {
        if (mixin === void 0) { mixin = false; }
        conf.defaults = mixin ? mix(conf.defaults, options) : options;
        return this;
    };
    /**
     * Sets the method (text, json ...) used to parse the data contained in the response body in case of an HTTP error.
     *
     * Persists for every subsequent requests.
     *
     * Default is "text".
     */
    Wretcher.prototype.errorType = function (method) {
        conf.errorType = method;
        return this;
    };
    /**
     * Sets the non-global polyfills which will be used for every subsequent calls.
     *
     * Needed for libraries like [fetch-ponyfill](https://github.com/qubyte/fetch-ponyfill).
     *
     * @param polyfills An object containing the polyfills.
     */
    Wretcher.prototype.polyfills = function (polyfills) {
        conf.polyfills = __assign(__assign({}, conf.polyfills), polyfills);
        return this;
    };
    /**
     * Returns a new Wretcher object with the argument url appended and the same options.
     * @param url String url
     * @param replace Boolean If true, replaces the current url instead of appending
     */
    Wretcher.prototype.url = function (url, replace) {
        if (replace === void 0) { replace = false; }
        if (replace)
            return this.selfFactory({ url: url });
        var split = this._url.split("?");
        return this.selfFactory({
            url: split.length > 1 ?
                split[0] + url + "?" + split[1] :
                this._url + url
        });
    };
    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    Wretcher.prototype.options = function (options, mixin) {
        if (mixin === void 0) { mixin = true; }
        return this.selfFactory({ options: mixin ? mix(this._options, options) : options });
    };
    /**
     * Converts a javascript object to query parameters,
     * then appends this query string to the current url.
     *
     * If given a string, use the string as the query verbatim.
     *
     * ```
     * let w = wretch("http://example.com") // url is http://example.com
     *
     * // Chain query calls
     * w = w.query({ a: 1, b : 2 }) // url is now http://example.com?a=1&b=2
     * w = w.query("foo-bar-baz-woz") // url is now http://example.com?a=1&b=2&foo-bar-baz-woz
     *
     * // Pass true as the second argument to replace existing query parameters
     * w = w.query("c=3&d=4", true) // url is now http://example.com?c=3&d=4
     * ```
     *
     * @param qp An object which will be converted, or a string which will be used verbatim.
     */
    Wretcher.prototype.query = function (qp, replace) {
        if (replace === void 0) { replace = false; }
        return this.selfFactory({ url: appendQueryParams(this._url, qp, replace) });
    };
    /**
     * Set request headers.
     * @param headerValues An object containing header keys and values
     */
    Wretcher.prototype.headers = function (headerValues) {
        return this.selfFactory({ options: mix(this._options, { headers: headerValues || {} }) });
    };
    /**
     * Shortcut to set the "Accept" header.
     * @param headerValue Header value
     */
    Wretcher.prototype.accept = function (headerValue) {
        return this.headers({ Accept: headerValue });
    };
    /**
     * Shortcut to set the "Content-Type" header.
     * @param headerValue Header value
     */
    Wretcher.prototype.content = function (headerValue) {
        var _a;
        return this.headers((_a = {}, _a[CONTENT_TYPE_HEADER] = headerValue, _a));
    };
    /**
     * Shortcut to set the "Authorization" header.
     * @param headerValue Header value
     */
    Wretcher.prototype.auth = function (headerValue) {
        return this.headers({ Authorization: headerValue });
    };
    /**
     * Adds a default catcher which will be called on every subsequent request error when the error code matches.
     * @param errorId Error code or name
     * @param catcher: The catcher method
     */
    Wretcher.prototype.catcher = function (errorId, catcher) {
        var newMap = new Map(this._catchers);
        newMap.set(errorId, catcher);
        return this.selfFactory({ catchers: newMap });
    };
    /**
     * Associates a custom signal with the request.
     * @param controller : An AbortController
     */
    Wretcher.prototype.signal = function (controller) {
        return this.selfFactory({ options: __assign(__assign({}, this._options), { signal: controller.signal }) });
    };
    /**
     * Program a resolver to perform response chain tasks automatically.
     * @param doResolve : Resolver callback
     */
    Wretcher.prototype.resolve = function (doResolve, clear) {
        if (clear === void 0) { clear = false; }
        return this.selfFactory({ resolvers: clear ? [doResolve] : __spreadArrays(this._resolvers, [doResolve]) });
    };
    /**
     * Defer wretcher methods that will be chained and called just before the request is performed.
     */
    Wretcher.prototype.defer = function (callback, clear) {
        if (clear === void 0) { clear = false; }
        return this.selfFactory({
            deferredChain: clear ? [callback] : __spreadArrays(this._deferredChain, [callback])
        });
    };
    /**
     * Add middlewares to intercept a request before being sent.
     */
    Wretcher.prototype.middlewares = function (middlewares, clear) {
        if (clear === void 0) { clear = false; }
        return this.selfFactory({
            middlewares: clear ? middlewares : __spreadArrays(this._middlewares, middlewares)
        });
    };
    Wretcher.prototype.method = function (method, options, body) {
        if (options === void 0) { options = {}; }
        if (body === void 0) { body = null; }
        var headers = this._options.headers;
        var baseWretcher = !body ? this :
            typeof body === "object" && (!headers ||
                Object.entries(headers).every(function (_a) {
                    var k = _a[0], v = _a[1];
                    return k.toLowerCase() !== CONTENT_TYPE_HEADER.toLowerCase() ||
                        v.startsWith(JSON_MIME);
                })) ? this.json(body) :
                this.body(body);
        baseWretcher = baseWretcher.options(__assign(__assign({}, options), { method: method }));
        var deferredWretcher = baseWretcher._deferredChain.reduce(function (acc, curr) { return curr(acc, acc._url, acc._options); }, baseWretcher);
        return resolver(deferredWretcher);
    };
    /**
     * Performs a get request.
     */
    Wretcher.prototype.get = function (options) {
        return this.method("GET", options);
    };
    /**
     * Performs a delete request.
     */
    Wretcher.prototype.delete = function (options) {
        return this.method("DELETE", options);
    };
    /**
     * Performs a put request.
     */
    Wretcher.prototype.put = function (body, options) {
        return this.method("PUT", options, body);
    };
    /**
     * Performs a post request.
     */
    Wretcher.prototype.post = function (body, options) {
        return this.method("POST", options, body);
    };
    /**
     * Performs a patch request.
     */
    Wretcher.prototype.patch = function (body, options) {
        return this.method("PATCH", options, body);
    };
    /**
     * Performs a head request.
     */
    Wretcher.prototype.head = function (options) {
        return this.method("HEAD", options);
    };
    /**
     * Performs an options request
     */
    Wretcher.prototype.opts = function (options) {
        return this.method("OPTIONS", options);
    };
    /**
     * Replay a request.
     */
    Wretcher.prototype.replay = function (options) {
        return this.method(this._options.method, options);
    };
    /**
     * Sets the request body with any content.
     * @param contents The body contents
     */
    Wretcher.prototype.body = function (contents) {
        return this.selfFactory({ options: __assign(__assign({}, this._options), { body: contents }) });
    };
    /**
     * Sets the content type header, stringifies an object and sets the request body.
     * @param jsObject An object which will be serialized into a JSON
     */
    Wretcher.prototype.json = function (jsObject) {
        var _a;
        var preservedContentType = (_a = Object.entries(this._options.headers || {}).find(function (_a) {
            var k = _a[0], v = _a[1];
            return k.toLowerCase() === CONTENT_TYPE_HEADER.toLowerCase() && v.startsWith(JSON_MIME);
        })) === null || _a === void 0 ? void 0 : _a[1];
        return this.content(preservedContentType || JSON_MIME).body(JSON.stringify(jsObject));
    };
    /**
     * Converts the javascript object to a FormData and sets the request body.
     * @param formObject An object which will be converted to a FormData
     * @param recursive If `true`, will recurse through all nested objects
     * Can be set as an array of string to exclude specific keys.
     * See https://github.com/elbywan/wretch/issues/68 for more details.
     */
    Wretcher.prototype.formData = function (formObject, recursive) {
        if (recursive === void 0) { recursive = false; }
        return this.body(convertFormData(formObject, recursive));
    };
    /**
     * Converts the input to an url encoded string and sets the content-type header and body.
     * If the input argument is already a string, skips the conversion part.
     *
     * @param input An object to convert into an url encoded string or an already encoded string
     */
    Wretcher.prototype.formUrl = function (input) {
        return this
            .body(typeof input === "string" ? input : convertFormUrl(input))
            .content("application/x-www-form-urlencoded");
    };
    return Wretcher;
}());
export { Wretcher };
// Internal helpers
var appendQueryParams = function (url, qp, replace) {
    var queryString;
    if (typeof qp === "string") {
        queryString = qp;
    }
    else {
        var usp = conf.polyfill("URLSearchParams", { instance: true });
        for (var key in qp) {
            if (qp[key] instanceof Array) {
                for (var _i = 0, _a = qp[key]; _i < _a.length; _i++) {
                    var val = _a[_i];
                    usp.append(key, val);
                }
            }
            else {
                usp.append(key, qp[key]);
            }
        }
        queryString = usp.toString();
    }
    var split = url.split("?");
    if (replace || split.length < 2)
        return split[0] + "?" + queryString;
    return url + "&" + queryString;
};
function convertFormData(formObject, recursive, formData, ancestors) {
    if (recursive === void 0) { recursive = false; }
    if (formData === void 0) { formData = conf.polyfill("FormData", { instance: true }); }
    if (ancestors === void 0) { ancestors = []; }
    Object.entries(formObject).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var formKey = ancestors.reduce(function (acc, ancestor) { return (acc ? acc + "[" + ancestor + "]" : ancestor); }, null);
        formKey = formKey ? formKey + "[" + key + "]" : key;
        if (value instanceof Array) {
            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                var item = value_1[_i];
                formData.append(formKey + "[]", item);
            }
        }
        else if (recursive &&
            typeof value === "object" &&
            (!(recursive instanceof Array) ||
                !recursive.includes(key))) {
            if (value !== null) {
                convertFormData(value, recursive, formData, __spreadArrays(ancestors, [key]));
            }
        }
        else {
            formData.append(formKey, value);
        }
    });
    return formData;
}
function encodeQueryValue(key, value) {
    return encodeURIComponent(key) +
        "=" +
        encodeURIComponent(typeof value === "object" ?
            JSON.stringify(value) :
            "" + value);
}
function convertFormUrl(formObject) {
    return Object.keys(formObject)
        .map(function (key) {
        var value = formObject[key];
        if (value instanceof Array) {
            return value.map(function (v) { return encodeQueryValue(key, v); }).join("&");
        }
        return encodeQueryValue(key, value);
    })
        .join("&");
}
//# sourceMappingURL=wretcher.js.map