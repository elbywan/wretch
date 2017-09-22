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
    function Wretcher(_url, _options) {
        if (_options === void 0) { _options = {}; }
        this._url = _url;
        this._options = _options;
    }
    /**
     * Sets the default fetch options used for every subsequent fetch call.
     * @param opts New default options
     */
    Wretcher.prototype.defaults = function (opts) {
        conf.defaults = opts;
        return this;
    };
    /**
     * Mixins the default fetch options used for every subsequent fetch calls.
     * @param opts Options to mixin with the current default options
     */
    Wretcher.prototype.mixdefaults = function (opts) {
        conf.defaults = mix(conf.defaults, opts);
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
     * Returns a new Wretcher object with the url specified and the same options.
     * @param url String url
     */
    Wretcher.prototype.url = function (url) {
        return new Wretcher(url, this._options);
    };
    /**
     * Returns a wretch factory which, when called, creates a new Wretcher object with the base url as an url prefix.
     * @param baseurl The base url
     */
    Wretcher.prototype.baseUrl = function (baseurl) {
        return function (url, opts) {
            if (url === void 0) { url = ""; }
            if (opts === void 0) { opts = {}; }
            return new Wretcher(baseurl + url, opts);
        };
    };
    /**
     * Returns a new Wretcher object with the same url and new options.
     * @param options New options
     */
    Wretcher.prototype.options = function (options) {
        return new Wretcher(this._url, options);
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
        return new Wretcher(appendQueryParams(this._url, qp), this._options);
    };
    /**
     * Set request headers.
     * @param headerValues An object containing header key and values
     */
    Wretcher.prototype.headers = function (headerValues) {
        return new Wretcher(this._url, mix(this._options, { headers: headerValues }));
    };
    /**
     * Shortcut to set the "Accept" header.
     * @param what Header value
     */
    Wretcher.prototype.accept = function (headerValue) {
        return this.headers({ Accept: headerValue });
    };
    /**
     * Shortcut to set the "Content-Type" header.
     * @param what Header value
     */
    Wretcher.prototype.content = function (headerValue) {
        return this.headers({ "Content-Type": headerValue });
    };
    /**
     * Performs a get request.
     */
    Wretcher.prototype.get = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(mix(opts, this._options));
    };
    /**
     * Performs a delete request.
     */
    Wretcher.prototype.delete = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(__assign({}, mix(opts, this._options), { method: "DELETE" }));
    };
    /**
     * Performs a put request.
     */
    Wretcher.prototype.put = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(__assign({}, mix(opts, this._options), { method: "PUT" }));
    };
    /**
     * Performs a post request.
     */
    Wretcher.prototype.post = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(__assign({}, mix(opts, this._options), { method: "POST" }));
    };
    /**
     * Performs a patch request.
     */
    Wretcher.prototype.patch = function (opts) {
        if (opts === void 0) { opts = {}; }
        return resolver(this._url)(__assign({}, mix(opts, this._options), { method: "PATCH" }));
    };
    /**
     * Sets the request body with any content.
     * @param contents The body contents
     */
    Wretcher.prototype.body = function (contents) {
        return new Wretcher(this._url, __assign({}, this._options, { body: contents }));
    };
    /**
     * Sets the content type header, stringifies an object and sets the request body.
     * @param jsObject An object
     */
    Wretcher.prototype.json = function (jsObject) {
        return this.content("application/json").body(JSON.stringify(jsObject));
    };
    /**
     * Converts the javascript object to a FormData and sets the request body.
     * @param formObject An object
     */
    Wretcher.prototype.formData = function (formObject) {
        var formData = new FormData();
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
    var usp = new URLSearchParams();
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