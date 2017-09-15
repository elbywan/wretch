var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { mix } from "./mix";
// Default options
var defaults = {};
var errorType = null;
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
        defaults = opts;
        return this;
    };
    /**
     * Mixins the default fetch options used for every subsequent fetch calls.
     * @param opts Options to mixin with the current default options
     */
    Wretcher.prototype.mixdefaults = function (opts) {
        defaults = mix(defaults, opts);
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
        errorType = method;
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
     * Shortcut to set the "Accept" header.
     * @param what Header value
     */
    Wretcher.prototype.accept = function (what) {
        return new Wretcher(this._url, mix(this._options, { headers: { "Accept": what } }));
    };
    /**
    * Performs a get request.
    */
    Wretcher.prototype.get = function (opts) {
        if (opts === void 0) { opts = {}; }
        return doFetch(this._url)(mix(opts, this._options));
    };
    /**
    * Performs a delete request.
    */
    Wretcher.prototype.delete = function (opts) {
        if (opts === void 0) { opts = {}; }
        return doFetch(this._url)(__assign({}, mix(opts, this._options), { method: "DELETE" }));
    };
    /**
    * Performs a put request.
    */
    Wretcher.prototype.put = function (opts) {
        if (opts === void 0) { opts = {}; }
        return doFetch(this._url)(__assign({}, mix(opts, this._options), { method: "PUT" }));
    };
    /**
    * Performs a post request.
    */
    Wretcher.prototype.post = function (opts) {
        if (opts === void 0) { opts = {}; }
        return doFetch(this._url)(__assign({}, mix(opts, this._options), { method: "POST" }));
    };
    /**
    * Performs a patch request.
    */
    Wretcher.prototype.patch = function (opts) {
        if (opts === void 0) { opts = {}; }
        return doFetch(this._url)(__assign({}, mix(opts, this._options), { method: "PATCH" }));
    };
    /**
     * Sets the content type header, stringifies an object and sets the request body.
     * @param jsObject An object
     */
    Wretcher.prototype.json = function (jsObject) {
        return new Wretcher(this._url, __assign({}, this._options, { headers: { "Content-Type": "application/json" }, body: JSON.stringify(jsObject) }));
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
        return new Wretcher(this._url, __assign({}, this._options, { body: formData }));
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
var doFetch = function (url) { return function (opts) {
    if (opts === void 0) { opts = {}; }
    var req = fetch(url, mix(defaults, opts));
    var wrapper = req.then(function (response) {
        if (!response.ok) {
            return response[errorType || "text"]().then(function (_) {
                var err = new Error(_);
                err[errorType] = _;
                err["status"] = response.status;
                err["response"] = response;
                throw err;
            });
        }
        return response;
    });
    var catchers = [];
    var doCatch = function (promise) { return catchers.reduce(function (accumulator, catcher) { return accumulator.catch(catcher); }, promise); };
    var wrapTypeParser = function (funName) { return function (cb) { return funName ?
        doCatch(wrapper.then(function (_) { return _ && _[funName](); }).then(function (_) { return _ && cb && cb(_) || _; })) :
        doCatch(wrapper.then(function (_) { return _ && cb && cb(_) || _; })); }; };
    var responseTypes = {
        /**
         * Retrieves the raw result as a promise.
         */
        res: wrapTypeParser(null),
        /**
         * Retrieves the result as a parsed JSON object.
         */
        json: wrapTypeParser("json"),
        /**
         * Retrieves the result as a Blob object.
         */
        blob: wrapTypeParser("blob"),
        /**
         * Retrieves the result as a FormData object.
         */
        formData: wrapTypeParser("formData"),
        /**
         * Retrieves the result as an ArrayBuffer object.
         */
        arrayBuffer: wrapTypeParser("arrayBuffer"),
        /**
         * Retrieves the result as a string.
         */
        text: wrapTypeParser("text"),
        /**
         * Catches an http response with a specific error code and performs a callback.
         */
        error: function (code, cb) {
            catchers.push(function (err) {
                if (err.status === code)
                    cb(err);
                else
                    throw err;
            });
            return responseTypes;
        },
        /**
         * Catches a bad request (http code 400) and performs a callback.
         */
        badRequest: function (cb) { return responseTypes.error(400, cb); },
        /**
         * Catches an unauthorized request (http code 401) and performs a callback.
         */
        unauthorized: function (cb) { return responseTypes.error(401, cb); },
        /**
         * Catches a forbidden request (http code 403) and performs a callback.
         */
        forbidden: function (cb) { return responseTypes.error(403, cb); },
        /**
         * Catches a "not found" request (http code 404) and performs a callback.
         */
        notFound: function (cb) { return responseTypes.error(404, cb); },
        /**
         * Catches a timeout (http code 408) and performs a callback.
         */
        timeout: function (cb) { return responseTypes.error(408, cb); },
        /**
         * Catches an internal server error (http code 500) and performs a callback.
         */
        internalError: function (cb) { return responseTypes.error(500, cb); }
    };
    return responseTypes;
}; };
//# sourceMappingURL=wretcher.js.map