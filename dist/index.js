import { Wretcher } from "./wretcher";
if (typeof self === "undefined") {
    global.URLSearchParams = require("url").URLSearchParams;
}
/**
 * Return a fresh Wretcher instance.
 */
export default function (url, opts) {
    if (url === void 0) { url = ""; }
    if (opts === void 0) { opts = {}; }
    return new Wretcher(url, opts);
};
//# sourceMappingURL=index.js.map