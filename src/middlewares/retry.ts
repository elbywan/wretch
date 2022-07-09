import type { ConfiguredMiddleware, WretchOptions } from "../types.js"

/* Types */

export type DelayRampFunction = (delay: number, nbOfAttempts: number) => number
export type UntilFunction = (response?: Response, error?: Error) => boolean | Promise<boolean>
export type OnRetryFunctionResponse = { url?: string; options?: WretchOptions } | undefined
export type OnRetryFunction = (args: {
  response?: Response,
  error?: Error,
  url: string,
  options: WretchOptions
}) => void | OnRetryFunctionResponse | Promise<OnRetryFunctionResponse>
export type RetryOptions = {
  delayTimer?: number,
  delayRamp?: DelayRampFunction,
  maxAttempts?: number,
  until?: UntilFunction,
  onRetry?: OnRetryFunction,
  retryOnNetworkError?: boolean,
}

/**
 * ## Retry middleware
 *
 * #### Retries a request multiple times in case of an error (or until a custom condition is true).
 *
 * **Options**
 *
 * - *delayTimer* `milliseconds`
 *
 * > The timer between each attempt.
 *
 * > *(default: 500)*
 *
 * - *delayRamp* `(delay, nbOfAttempts) => milliseconds`
 *
 * > The custom function that is used to calculate the actual delay based on the the timer & the number of attemps.
 *
 * > *(default: delay * nbOfAttemps)*
 *
 * - *maxAttempts* `number`
 *
 * > The maximum number of retries before resolving the promise with the last error. Specifying 0 means infinite retries.
 *
 * > *(default: 10)*
 *
 * - *until* `(response, error) => boolean || Promise<boolean>`
 *
 * > The request will be retried until that condition is satisfied.
 *
 * > *(default: response && response.ok)*
 *
 * - *onRetry* `({ response, error, url, options }) => { url?, options? } || Promise<{url?, options?}>`
 *
 * > Callback that will get executed before retrying the request. If this function returns an object having url and/or options properties, they will override existing values in the retried request.
 *
 * > *(default: null)*
 *
 * - *retryOnNetworkError* `boolean`
 *
 * > If true, will retry the request if a network error was thrown. Will also provide an 'error' argument to the `onRetry` and `until` methods.
 *
 * > *(default: false)*
 */
export type RetryMiddleware = (options?: RetryOptions) => ConfiguredMiddleware

/* Defaults */

const defaultDelayRamp: DelayRampFunction = (delay, nbOfAttempts) => (
  delay * nbOfAttempts
)
const defaultUntil: UntilFunction = response => response && response.ok

export const retry: RetryMiddleware = ({
  delayTimer = 500,
  delayRamp = defaultDelayRamp,
  maxAttempts = 10,
  until = defaultUntil,
  onRetry = null,
  retryOnNetworkError = false
} = {}) => {

  return next => (url, opts) => {
    let numberOfAttemptsMade = 0

    const checkStatus = (response?: Response, error?: Error) => {
      return Promise.resolve(until(response, error)).then(done => {
        // If the response is unexpected
        if (!done) {
          numberOfAttemptsMade++

          if (!maxAttempts || numberOfAttemptsMade <= maxAttempts) {
            // We need to recurse until we have a correct response and chain the checks
            return new Promise(resolve => {
              const delay = delayRamp(delayTimer, numberOfAttemptsMade)
              setTimeout(() => {
                if (typeof onRetry === "function") {
                  Promise.resolve(onRetry({
                    response,
                    error,
                    url,
                    options: opts
                  })).then((values = {}) => {
                    resolve(next((values as any).url ?? url, (values as any).options ?? opts))
                  })
                } else {
                  resolve(next(url, opts))
                }
              }, delay)
            }).then(checkStatus).catch(error => {
              if (!retryOnNetworkError)
                throw error
              return checkStatus(null, error)
            })
          } else {
            return Promise.reject(error || new Error("Number of attempts exceeded."))
          }
        }

        return error ? Promise.reject(error) : response
      })
    }

    return next(url, opts)
      .then(checkStatus)
      .catch(error => {
        if (!retryOnNetworkError)
          throw error
        return checkStatus(null, error)
      })
  }
}
