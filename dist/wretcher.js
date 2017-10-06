var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { mix } from "./mix";
import conf from "./config";
import { resolver } from "./resolver";
/**
 * The Wretcher class used to perform easy fetch requests.
 *
 * Immutability : almost every method of this class return a fresh Wretcher object.
 */
var Wretcher = /** @class */ (function () {
    function Wretcher(_url, _options, _catchers) {
        if (_options === void 0) { _options = {}; }
        if (_catchers === void 0) { _catchers = new Map(); }
        this._url = _url;
        this._options = _options;
        this._catchers = _catchers;
    }
    Wretcher.factory = function (url, opts) {
        if (url === void 0) { url = ""; }
        if (opts === void 0) { opts = {}; }
        return new Wretcher(url, opts);
    };
    Wretcher.prototype.selfFactory = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.url, url = _c === void 0 ? this._url : _c, _d = _b.options, options = _d === void 0 ? this._options : _d, _e = _b.catchers, catchers = _e === void 0 ? this._catchers : _e;
        return new Wretcher(url, options, catchers);
    };
    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param opts New default options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    Wretcher.prototype.defaults = function (opts, mixin) {
        if (mixin === void 0) { mixin = false; }
        conf.defaults = mixin ? conf.defaults = mix(conf.defaults, opts) : opts;
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
        conf.polyfills = __assign({}, conf.polyfills, polyfills);
        return this;
    };
    /**
     * Returns a new Wretcher object with the argument url appended and the same options.
     * @param url String url
     * @param replace Boolean it true, replaces the current url instead of appending
     */
    Wretcher.prototype.url = function (url, replace) {
        if (replace === void 0) { replace = false; }
        return replace ? this.selfFactory({ url: url }) : this.selfFactory({ url: this._url + url });
    };
    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     * @param mixin If true, mixes in instead of replacing the existing options
     */
    Wretcher.prototype.options = function (options, mixin) {
        if (mixin === void 0) { mixin = false; }
        return this.selfFactory({ options: mixin ? mix(this._options, options) : options });
    };
    /**
     * Converts a javascript object to query parameters,
     * then appends this query string to the current url.
     *
     * ```
     * let w = wretch("http://example.com") // url is http://example.com
     * w = w.query({ a: 1, b : 2 }) // url is now http://example.com?a=1&b=2
     * ```
     *
     * @param qp An object which will be converted.
     */
    Wretcher.prototype.query = function (qp) {
        return this.selfFactory({ url: appendQueryParams(this._url, qp) });
    };
    /**
     * Set request headers.
     * @param headerValues An object containing header keys and values
     */
    Wretcher.prototype.headers = function (headerValues) {
        return this.selfFactory({ options: mix(this._options, { headers: headerValues }) });
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
        return this.headers({ "Content-Type": headerValue });
    };
    /**
     * Adds a default catcher which will be called on every subsequent request error when the error code matches.
     * @param code Error code
     * @param catcher: The catcher method
     */
    Wretcher.prototype.catcher = function (code, catcher) {
        var newMap = new Map(this._catchers);
        newMap.set(code, catcher);
        return this.selfFactory({ catchers: newMap });
    };
    /**
     * Performs a get request.
     */
    Wretcher.prototype.get = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(this._catchers)(mix(opts, this._options));
    };
    /**
     * Performs a delete request.
     */
    Wretcher.prototype.delete = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(this._catchers)(__assign({}, mix(opts, this._options), { method: "DELETE" }));
    };
    /**
     * Performs a put request.
     */
    Wretcher.prototype.put = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(this._catchers)(__assign({}, mix(opts, this._options), { method: "PUT" }));
    };
    /**
     * Performs a post request.
     */
    Wretcher.prototype.post = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(this._catchers)(__assign({}, mix(opts, this._options), { method: "POST" }));
    };
    /**
     * Performs a patch request.
     */
    Wretcher.prototype.patch = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(this._catchers)(__assign({}, mix(opts, this._options), { method: "PATCH" }));
    };
    /**
     * Sets the request body with any content.
     * @param contents The body contents
     */
    Wretcher.prototype.body = function (contents) {
        return this.selfFactory({ options: __assign({}, this._options, { body: contents }) });
    };
    /**
     * Sets the content type header, stringifies an object and sets the request body.
     * @param jsObject An object which will be serialized into a JSON
     */
    Wretcher.prototype.json = function (jsObject) {
        return this.content("application/json").body(JSON.stringify(jsObject));
    };
    /**
     * Converts the javascript object to a FormData and sets the request body.
     * @param formObject An object which will be converted to a FormData
     */
    Wretcher.prototype.formData = function (formObject) {
        var formData = new (conf.polyfill("FormData"))();
        for (var key in formObject) {
            if (formObject[key] instanceof Array) {
                for (var _i = 0, _a = formObject[key]; _i < _a.length; _i++) {
                    var item = _a[_i];
                    formData.append(key + "[]", item);
                }
            }
            else {
                formData.append(key, formObject[key]);
            }
        }
        return this.body(formData);
    };
    return Wretcher;
}());
export { Wretcher };
// Internal helpers
var appendQueryParams = function (url, qp) {
    var usp = new (conf.polyfill("URLSearchParams"))();
    var index = url.indexOf("?");
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
    return ~index ?
        url.substring(0, index) + "?" + usp.toString() :
        url + "?" + usp.toString();
};
//# sourceMappingURL=wretcher.js.map