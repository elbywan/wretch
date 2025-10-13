import type { Wretch, WretchAddon } from "../types.js"

/**
 * Options for the formData method.
 */
export type FormDataOptions = {
  /**
   * Enable recursion through nested objects to produce `object[key]` keys.
   * When set to `true`, all nested objects will be recursively converted.
   * When set to an array of strings, the specified keys will be excluded from recursion.
   */
  recursive?: string[] | boolean
}

function convertFormData(
  formObject: object,
  recursive: string[] | boolean = false,
  formData = new FormData(),
  ancestors = [] as string[],
) {
  Object.entries(formObject).forEach(([key, value]) => {
    let formKey = ancestors.reduce((acc, ancestor) => (
      acc ? `${acc}[${ancestor}]` : ancestor
    ), null)
    formKey = formKey ? `${formKey}[${key}]` : key
    if (value instanceof Array || (globalThis.FileList && value instanceof FileList)) {
      for (const item of value as File[])
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
        convertFormData(value, recursive, formData, [...ancestors, key])
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
   * The `recursive` option when set to `true` will enable recursion through all
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
   * wretch("...").addons(FormDataAddon).formData(form, { recursive: ["ignored"] }).post();
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
   * @param options - Optional configuration object
   */
  formData<T extends FormDataAddon, C, R, E>(this: T & Wretch<T, C, R, E>, formObject: object, options?: FormDataOptions): this
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
    formData(formObject, options = {}) {
      return this.body(convertFormData(formObject, options.recursive ?? false))
    }
  }
}

export default formData
