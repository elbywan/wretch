import type { Wretch, WretchAddon } from "../types.js"

/**
 * Options for the query method.
 */
export type QueryStringOptions = {
  /**
   * Replace existing query parameters instead of appending to them.
   */
  replace?: boolean
  /**
   * Completely omit key=value pairs for undefined or null values.
   */
  omitUndefinedOrNullValues?: boolean
}

const appendQueryParams = (url: string, qp: object | string, replace: boolean, omitUndefinedOrNullValues: boolean) => {
  let queryString: string

  if (typeof qp === "string") {
    queryString = qp
  } else {
    const usp = new URLSearchParams()
    for (const key in qp) {
      const value = qp[key]
      if (omitUndefinedOrNullValues && (value === null || value === undefined)) continue
      if (Array.isArray(value)) {
        for (const val of value)
          usp.append(key, val ?? "")
      } else {
        usp.append(key, value ?? "")
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
   * Converts a javascript object to query parameters, then appends this query string
   * to the current url. String values are used as the query string verbatim.
   *
   * Set `replace` to `true` in the options to replace existing query parameters.
   * Set `omitUndefinedOrNullValues` to `true` in the options to completely omit the key=value pair for undefined or null values.
   *
   * ```
   * import QueryAddon from "wretch/addons/queryString"
   *
   * let w = wretch("http://example.com").addon(QueryStringAddon);
   * // url is http://example.com
   * w = w.query({ a: 1, b: 2 });
   * // url is now http://example.com?a=1&b=2
   * w = w.query({ c: 3, d: [4, 5] });
   * // url is now http://example.com?a=1&b=2c=3&d=4&d=5
   * w = w.query("five&six&seven=eight");
   * // url is now http://example.com?a=1&b=2c=3&d=4&d=5&five&six&seven=eight
   * w = w.query({ reset: true }, { replace: true });
   * // url is now  http://example.com?reset=true
   * ```
   *
   * ##### **Note that .query is not meant to handle complex cases with nested objects.**
   *
   * For this kind of usage, you can use `wretch` in conjunction with other libraries
   * (like [`qs`](https://github.com/ljharb/qs)).
   *
   * ```js
   * // Using wretch with qs
   *
   * const queryObject = { some: { nested: "objects" } };
   * const w = wretch("https://example.com/").addon(QueryStringAddon)
   *
   * // Use .qs inside .query :
   *
   * w.query(qs.stringify(queryObject));
   *
   * // Use .defer :
   *
   * const qsWretch = w.defer((w, url, { qsQuery, qsOptions }) => (
   *   qsQuery ? w.query(qs.stringify(qsQuery, qsOptions)) : w
   * ));
   *
   * qsWretch
   *   .url("https://example.com/")
   *   .options({ qs: { query: queryObject } });
   * ```
   *
   * @param qp - An object which will be converted, or a string which will be used verbatim.
   * @param options - Optional configuration object
   */
  query<T extends QueryStringAddon, C, R, E>(this: T & Wretch<T, C, R, E>, qp: object | string, options?: QueryStringOptions): this
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
    query(qp, options = {}) {
      return { ...this, _url: appendQueryParams(this._url, qp, options.replace ?? false, options.omitUndefinedOrNullValues ?? false) }
    }
  }
}

export default queryString
