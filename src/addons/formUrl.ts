import type { Wretch } from "../core.js"
import type { WretchAddon } from "../types.js"

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
   * Converts the input to an url encoded string and sets the content-type header and body.
   * If the input argument is already a string, skips the conversion part.
   *
   * @param input - An object to convert into an url encoded string or an already encoded string
   */
  formUrl<T extends FormUrlAddon, C>(this: T & Wretch<T, C>, input: (object | string)): this
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