import type { Wretch, Config, WretchAddon } from "../types.js"

function convertFormData(
  formObject: object,
  recursive: string[] | boolean = false,
  config: Config,
  formData = config.polyfill("FormData", true, true),
  ancestors = [],
) {
  Object.entries(formObject).forEach(([key, value]) => {
    let formKey = ancestors.reduce((acc, ancestor) => (
      acc ? `${acc}[${ancestor}]` : ancestor
    ), null)
    formKey = formKey ? `${formKey}[${key}]` : key
    if (value instanceof Array) {
      for (const item of value)
        formData.append(formKey, item)
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

export interface FormDataAddon {
  /**
   * Converts the javascript object to a FormData and sets the request body.
   *
   * ```js
   * const form = {
   *   hello: "world",
   *   duck: "Muscovy",
   * };
   *
   * wretch("...").addons(FormDataAddon).formData(form).post();
   * ```
   *
   * The `recursive` argument when set to `true` will enable recursion through all
   * nested objects and produce `object[key]` keys. It can be set to an array of
   * string to exclude specific keys.
   *
   * > Warning: Be careful to exclude `Blob` instances in the Browser, and
   * > `ReadableStream` and `Buffer` instances when using the node.js compatible
   * > `form-data` package.
   *
   * ```js
   * const form = {
   *   duck: "Muscovy",
   *   duckProperties: {
   *     beak: {
   *       color: "yellow",
   *     },
   *     legs: 2,
   *   },
   *   ignored: {
   *     key: 0,
   *   },
   * };
   *
   * // Will append the following keys to the FormData payload:
   * // "duck", "duckProperties[beak][color]", "duckProperties[legs]"
   * wretch("...").addons(FormDataAddon).formData(form, ["ignored"]).post();
   * ```
   *
   * > Note: This addon does not support specifying a custom `filename`.
   * > If you need to do so, you can use the `body` method directly:
   * > ```js
   * > const form = new FormData();
   * > form.append("hello", "world", "hello.txt");
   * > wretch("...").body(form).post();
   * > ```
   * > See: https://developer.mozilla.org/en-US/docs/Web/API/FormData/append#example
   *
   * @param formObject - An object which will be converted to a FormData
   * @param recursive - If `true`, will recurse through all nested objects. Can be set as an array of string to exclude specific keys.
   */
  formData<T extends FormDataAddon, C, R>(this: T & Wretch<T, C, R>, formObject: object, recursive?: string[] | boolean): this
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
const formData: WretchAddon<FormDataAddon> = {
  wretch: {
    formData(formObject, recursive = false) {
      return this.body(convertFormData(formObject, recursive, this._config))
    }
  }
}

export default formData
