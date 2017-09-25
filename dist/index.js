import { Wretcher } from "./wretcher";
if (typeof self === "undefined") {
    global.URLSearchParams = require("url").URLSearchParams;
}
/**
 * Return a fresh Wretcher instance.
 */
export default Wretcher.factory;
//# sourceMappingURL=index.js.map