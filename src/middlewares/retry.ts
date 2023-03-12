import type { ConfiguredMiddleware, WretchOptions } from "../types.js"

/* Types */

export type DelayRampFunction = (delay: number, nbOfAttempts: number) => number
export type UntilFunction = (
  response?: Response,
  error?: Error
) => boolean | Promise<boolean>
export type OnRetryFunctionResponse =
  | { url?: string; options?: WretchOptions }
  | undefined
export type OnRetryFunction = (args: {
  response?: Response
  error?: Error
  url: string
  options: WretchOptions
}) => void | OnRetryFunctionResponse | Promise<OnRetryFunctionResponse>
export type SkipFunction = (url: string, opts: WretchOptions) => boolean
export type RetryOptions = {
  /**
   * The timer between each attempt in milliseconds.
   *
   * _Default: `500`_
   */
  delayTimer?: number
  /**
   * The custom function that is used to calculate the actual delay based on the the timer & the number of attemps.
   *
   * _Default: `delay * nbOfAttemps`_
   */
  delayRamp?: DelayRampFunction
  /**
   * The maximum number of retries before resolving the promise with the last error. Specifying 0 means infinite retries.
   *
   * _Default: `10`_
   */
  maxAttempts?: number
  /**
   * The request will be retried until that condition is satisfied.
   *
   * _Default: `response && response.ok`_
   */
  until?: UntilFunction
  /**
   * Callback that will get executed before retrying the request. If this function returns an object having url and/or options properties, they will override existing values in the retried request.
   *
   * _Default: `undefined`_
   */
  onRetry?: OnRetryFunction
  /**
   * If true, will retry the request if a network error was thrown. Will also provide an 'error' argument to the `onRetry` and `until` methods.
   *
   * _Default: `false`_
   */
  retryOnNetworkError?: boolean
  /**
   * If true, the request will be resolved with the latest response instead of rejected with an error.
   *
   * _Default: `false`_
   */
  resolveWithLatestResponse?: boolean
  /**
   * If skip returns true, the request will not be retried.
   *
   * Example:
   * ```js
   * (url, options) => (
   *    options.method !== "GET"
   * )
   * ```
   *
   * _Default: `undefined`_
   */
  skip?: SkipFunction
}

/**
 * ## Retry middleware
 *
 * #### Retries a request multiple times in case of an error (or until a custom condition is true).
 *
 * > **💡 By default, the request will be retried if the response status is not in the 2xx range.**
 * >
 * > ```js
 * > // Replace the default condition with a custom one to avoid retrying on 4xx errors:
 * > until: (response, error) => response && (response.ok || (response.status >= 400 && response.status < 500))
 * > ```
 *
 * ```ts
 * import wretch from 'wretch'
 * import { retry } from 'wretch/middlewares'
 *
 * wretch().middlewares([
 *   retry({
 *     // Options - defaults below
 *     delayTimer: 500,
 *     delayRamp: (delay, nbOfAttempts) => delay * nbOfAttempts,
 *     maxAttempts: 10,
 *     until: (response, error) => response && response.ok,
 *     onRetry: null,
 *     retryOnNetworkError: false,
 *     resolveWithLatestResponse: false,
 *     skip: undefined
 *   })
 * ])
 *
 * // You can also return a Promise, which is useful if you want to inspect the body:
 * wretch().middlewares([
 *   retry({
 *     until: response =>
 *       response.clone().json().then(body =>
 *         body.field === 'something'
 *       )
 *   })
 * ])
 * ```
 */
export type RetryMiddleware = (options?: RetryOptions) => ConfiguredMiddleware

/* Defaults */

const defaultDelayRamp: DelayRampFunction = (delay, nbOfAttempts) =>
  delay * nbOfAttempts
const defaultUntil: UntilFunction = response => response && response.ok

export const retry: RetryMiddleware = ({
  delayTimer = 500,
  delayRamp = defaultDelayRamp,
  maxAttempts = 10,
  until = defaultUntil,
  onRetry = null,
  retryOnNetworkError = false,
  resolveWithLatestResponse = false,
  skip,
} = {}) => {
  return next => (url, opts) => {
    let numberOfAttemptsMade = 0

    if (skip && skip(url, opts)) {
      return next(url, opts)
    }

    const checkStatus = (response?: Response, error?: Error) => {
      return Promise.resolve(until(response, error)).then(done => {
        // If the response is not suitable
        if (!done) {
          numberOfAttemptsMade++

          if (!maxAttempts || numberOfAttemptsMade <= maxAttempts) {
            // We need to recurse until we have a correct response and chain the checks
            return new Promise(resolve => {
              const delay = delayRamp(delayTimer, numberOfAttemptsMade)
              setTimeout(() => {
                if (typeof onRetry === "function") {
                  Promise.resolve(
                    onRetry({
                      response,
                      error,
                      url,
                      options: opts,
                    })
                  ).then((values = {}) => {
                    resolve(
                      next(
                        (values && values.url) ?? url,
                        (values && values.options) ?? opts
                      )
                    )
                  })
                } else {
                  resolve(next(url, opts))
                }
              }, delay)
            })
              .then(checkStatus)
              .catch(error => {
                if (!retryOnNetworkError) throw error
                return checkStatus(null, error)
              })
          } else {
            return !!response && resolveWithLatestResponse
              ? response
              : Promise.reject(
                error || new Error("Number of attempts exceeded.")
              )
          }
        }

        return !!response && resolveWithLatestResponse
          ? response
          : error
            ? Promise.reject(error)
            : response
      })
    }

    return next(url, opts)
      .then(checkStatus)
      .catch(error => {
        if (!retryOnNetworkError) throw error
        return checkStatus(null, error)
      })
  }
}
