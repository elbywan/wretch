import type { Wretch, WretchAddon } from "../types.js"

function encodeQueryValue(key: string, value: unknown) {
  return encodeURIComponent(key) +
    "=" +
    encodeURIComponent(
      typeof value === "object" ?
        JSON.stringify(value) :
        "" + value
    )
}
function convertFormUrl(formObject: object) {
  return Object.keys(formObject)
    .map(key => {
      const value = formObject[key]
      if (value instanceof Array) {
        return value.map(v => encodeQueryValue(key, v)).join("&")
      }
      return encodeQueryValue(key, value)
    })
    .join("&")
}

export interface FormUrlAddon {
  /**
   * Converts the input parameter to an url encoded string and sets the content-type
   * header and body. If the input argument is already a string, skips the conversion
   * part.
   *
   * ```js
   * const form = { a: 1, b: { c: 2 } };
   * const alreadyEncodedForm = "a=1&b=%7B%22c%22%3A2%7D";
   *
   * // Automatically sets the content-type header to "application/x-www-form-urlencoded"
   * wretch("...").addon(FormUrlAddon).formUrl(form).post();
   * wretch("...").addon(FormUrlAddon).formUrl(alreadyEncodedForm).post();
   * ```
   *
   * @param input - An object to convert into an url encoded string or an already encoded string
   */
  formUrl<T extends FormUrlAddon, C, R>(this: T & Wretch<T, C, R>, input: (object | string)): this
}

/**
 * Adds the ability to convert a an object to a FormUrl and use it as a request body.
 *
 * ```js
 * import FormUrlAddon from "wretch/addons/formUrl"
 *
 * wretch().addon(FormUrlAddon)
 * ```
 */
const formUrl: WretchAddon<FormUrlAddon> = {
  wretch: {
    formUrl(input) {
      return this
        .body(typeof input === "string" ? input : convertFormUrl(input))
        .content("application/x-www-form-urlencoded")
    }
  }
}

export default formUrl
