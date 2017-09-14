import { Wretcher } from "./wretcher"

// URLSearchParams for node.js
declare const global
declare const require
if(typeof self === "undefined") {
    global.URLSearchParams = require("url").URLSearchParams
}

/**
 * Return a fresh Wretcher instance.
 */
export default (url = "", opts = {}) => new Wretcher(url, opts)