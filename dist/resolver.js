import { mix } from "./mix";
import conf from "./config";
import perfs from "./perfs";
import { middlewareHelper } from "./middleware";
export var resolver = function (wretcher) {
    var url = wretcher._url, _catchers = wretcher._catchers, resolvers = wretcher._resolvers, middlewares = wretcher._middlewares, opts = wretcher._options;
    var catchers = new Map(_catchers);
    var finalOptions = mix(conf.defaults, opts);
    var fetchController = conf.polyfill("AbortController", { doThrow: false, instance: true });
    if (!finalOptions["signal"] && fetchController) {
        finalOptions["signal"] = fetchController.signal;
    }
    // The generated fetch request
    var fetchRequest = middlewareHelper(middlewares)(conf.polyfill("fetch"))(url, finalOptions);
    // Throws on an http error
    var throwingPromise = fetchRequest.then(function (response) {
        if (!response.ok) {
            return response[conf.errorType || "text"]().then(function (msg) {
                // Enhances the error object
                var err = new Error(msg);
                err[conf.errorType || "text"] = msg;
                err["status"] = response.status;
                err["response"] = response;
                throw err;
            });
        }
        return response;
    });
    // Wraps the Promise in order to dispatch the error to a matching catcher
    var catchersWrapper = function (promise) {
        return promise.catch(function (err) {
            if (catchers.has(err.status))
                return catchers.get(err.status)(err, wretcher);
            else if (catchers.has(err.name))
                return catchers.get(err.name)(err, wretcher);
            else
                throw err;
        });
    };
    var bodyParser = function (funName) { return function (cb) { return funName ?
        // If a callback is provided, then callback with the body result otherwise return the parsed body itself.
        catchersWrapper(throwingPromise.then(function (_) { return _ && _[funName](); }).then(function (_) { return _ && cb && cb(_) || _; })) :
        // No body parsing method - return the response
        catchersWrapper(throwingPromise.then(function (_) { return _ && cb && cb(_) || _; })); }; };
    var responseChain = {
        /**
         * Retrieves the raw result as a promise.
         */
        res: bodyParser(null),
        /**
         * Retrieves the result as a parsed JSON object.
         */
        json: bodyParser("json"),
        /**
         * Retrieves the result as a Blob object.
         */
        blob: bodyParser("blob"),
        /**
         * Retrieves the result as a FormData object.
         */
        formData: bodyParser("formData"),
        /**
         * Retrieves the result as an ArrayBuffer object.
         */
        arrayBuffer: bodyParser("arrayBuffer"),
        /**
         * Retrieves the result as a string.
         */
        text: bodyParser("text"),
        /**
         * Performs a callback on the API performance timings of the request.
         *
         * Warning: Still experimental on browsers and node.js
         */
        perfs: function (cb) {
            fetchRequest.then(function (res) { return perfs.observe(res.url, cb); });
            return responseChain;
        },
        /**
         * Aborts the request after a fixed time.
         *
         * @param time Time in milliseconds
         * @param controller A custom controller
         */
        setTimeout: function (time, controller) {
            if (controller === void 0) { controller = fetchController; }
            setTimeout(function () { return controller.abort(); }, time);
            return responseChain;
        },
        /**
         * Returns the automatically generated AbortController alongside the current wretch response as a pair.
         */
        controller: function () { return [fetchController, responseChain]; },
        /**
         * Catches an http response with a specific error code or name and performs a callback.
         */
        error: function (errorId, cb) {
            catchers.set(errorId, cb);
            return responseChain;
        },
        /**
         * Catches a bad request (http code 400) and performs a callback.
         */
        badRequest: function (cb) { return responseChain.error(400, cb); },
        /**
         * Catches an unauthorized request (http code 401) and performs a callback.
         */
        unauthorized: function (cb) { return responseChain.error(401, cb); },
        /**
         * Catches a forbidden request (http code 403) and performs a callback.
         */
        forbidden: function (cb) { return responseChain.error(403, cb); },
        /**
         * Catches a "not found" request (http code 404) and performs a callback.
         */
        notFound: function (cb) { return responseChain.error(404, cb); },
        /**
         * Catches a timeout (http code 408) and performs a callback.
         */
        timeout: function (cb) { return responseChain.error(408, cb); },
        /**
         * Catches an internal server error (http code 500) and performs a callback.
         */
        internalError: function (cb) { return responseChain.error(500, cb); },
        /**
         * Catches an AbortError and performs a callback.
         */
        onAbort: function (cb) { return responseChain.error("AbortError", cb); }
    };
    return resolvers.reduce(function (chain, r) { return r(chain, wretcher); }, responseChain);
};
//# sourceMappingURL=resolver.js.map