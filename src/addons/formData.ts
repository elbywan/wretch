import type { Wretch } from "../core"
import type { Config } from "../config"
import type { WretchAddon } from "../types"

function convertFormData(
  formObject: object,
  recursive: string[] | boolean = false,
  config: Config,
  formData = config.polyfill("FormData", { instance: true }),
  ancestors = [],
) {
  Object.entries(formObject).forEach(([key, value]) => {
    let formKey = ancestors.reduce((acc, ancestor) => (
      acc ? `${acc}[${ancestor}]` : ancestor
    ), null)
    formKey = formKey ? `${formKey}[${key}]` : key
    if (value instanceof Array) {
      for (const item of value)
        formData.append(formKey + "[]", item)
    } else if (
      recursive &&
      typeof value === "object" &&
      (
        !(recursive instanceof Array) ||
        !recursive.includes(key)
      )
    ) {
      if (value !== null) {
        convertFormData(value, recursive, config, formData, [...ancestors, key])
      }
    } else {
      formData.append(formKey, value)
    }
  })

  return formData
}

interface FormData {
  /**
   * Converts the javascript object to a FormData and sets the request body.
   * @param formObject - An object which will be converted to a FormData
   * @param recursive - If `true`, will recurse through all nested objects
   * Can be set as an array of string to exclude specific keys.
   * @see https://github.com/elbywan/wretch/issues/68 for more details.
   */
  formData<T extends FormData, C>(this: T & Wretch<T, C>, formObject: object, recursive?: string[] | boolean): this
}

/**
 * Adds the ability to convert a an object to a FormData and use it as a request body.
 *
 * ```js
 * import FormDataAddon from "wretch/addons/formData"
 *
 * wretch().addon(FormDataAddon)
 * ```
 */
const formData: WretchAddon<FormData> = {
  wretch: {
    formData(formObject, recursive = false) {
      return this.body(convertFormData(formObject, recursive, this._config))
    }
  }
}

export default formData