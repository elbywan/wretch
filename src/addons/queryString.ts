import type { Wretch, Config, WretchAddon } from "../types.js"

const appendQueryParams = (url: string, qp: object | string, replace: boolean, config: Config) => {
  let queryString: string

  if (typeof qp === "string") {
    queryString = qp
  } else {
    const usp = config.polyfill("URLSearchParams", { instance: true })
    for (const key in qp) {
      if (qp[key] instanceof Array) {
        for (const val of qp[key])
          usp.append(key, val)
      } else {
        usp.append(key, qp[key])
      }
    }
    queryString = usp.toString()
  }

  const split = url.split("?")

  if (!queryString)
    return replace ? split[0] : url

  if (replace || split.length < 2)
    return split[0] + "?" + queryString

  return url + "&" + queryString
}

export interface QueryStringAddon {
  /**
   * Converts a javascript object to query parameters,
   * then appends this query string to the current url.
   *
   * If given a string, use the string as the query verbatim.
   *
   * ```
   * import QueryAddon from "wretch/addons/queryString"
   *
   * let w = wretch("http://example.com").addon(QueryAddon) // url is http://example.com
   *
   * // Chain query calls
   * w = w.query({ a: 1, b : 2 }) // url is now http://example.com?a=1&b=2
   * w = w.query("foo-bar-baz-woz") // url is now http://example.com?a=1&b=2&foo-bar-baz-woz
   *
   * // Pass true as the second argument to replace existing query parameters
   * w = w.query("c=3&d=4", true) // url is now http://example.com?c=3&d=4
   * ```
   *
   * @param qp - An object which will be converted, or a string which will be used verbatim.
   */
  query<T extends QueryStringAddon, C>(this: T & Wretch<T, C>, qp: object | string, replace?: boolean): this
}

/**
 * Adds the ability to append query parameters from a javascript object.
 *
 * ```js
 * import QueryAddon from "wretch/addons/queryString"
 *
 * wretch().addon(QueryAddon)
 * ```
 */
const queryString: WretchAddon<QueryStringAddon> = {
  wretch: {
    query(qp, replace = false) {
      return this.clone({ _url: appendQueryParams(this._url, qp, replace, this._config) })
    }
  }
}

export default queryString