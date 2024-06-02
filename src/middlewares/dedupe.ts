import type { ConfiguredMiddleware, WretchOptions } from "../types.js"

/* Types */

export type DedupeSkipFunction = (url: string, opts: WretchOptions) => boolean
export type DedupeKeyFunction = (url: string, opts: WretchOptions) => string
export type DedupeResolverFunction = (response: Response) => Response
export type DedupeOptions = {
  skip?: DedupeSkipFunction,
  key?: DedupeKeyFunction,
  resolver?: DedupeResolverFunction
}
/**
 * ## Dedupe middleware
 *
 * #### Prevents having multiple identical requests on the fly at the same time.
 *
 * **Options**
 *
 * - *skip* `(url, opts) => boolean`
 *
 * > If skip returns true, then the dedupe check is skipped.
 *
 * - *key* `(url, opts) => string`
 *
 * > Returns a key that is used to identify the request.
 *
 * - *resolver* `(response: Response) => Response`
 *
 * > This function is called when resolving the fetch response from duplicate calls.
 * By default it clones the response to allow reading the body from multiple sources.
 */
export type DedupeMiddleware = (options?: DedupeOptions) => ConfiguredMiddleware

/* Defaults */

const defaultSkip: DedupeSkipFunction = (_, opts) => (
  opts.skipDedupe || opts.method !== "GET"
)
const defaultKey: DedupeKeyFunction = (url: string, opts) => opts.method + "@" + url
const defaultResolver: DedupeResolverFunction = response => response.clone()

export const dedupe: DedupeMiddleware = ({ skip = defaultSkip, key = defaultKey, resolver = defaultResolver } = {}) => {

  const inflight = new Map()

  return next => (url, opts) => {

    if (skip(url, opts)) {
      return next(url, opts)
    }

    const _key = key(url, opts)

    if (!inflight.has(_key)) {
      inflight.set(_key, [])
    } else {
      return new Promise((resolve, reject) => {
        inflight.get(_key).push([resolve, reject])
      })
    }

    try {
      return next(url, opts)
        .then(response => {
          // Resolve pending promises
          inflight.get(_key).forEach(([resolve]) => resolve(resolver(response)))
          // Remove the inflight pending promises
          inflight.delete(_key)
          // Return the original response
          return response
        })
        .catch(error => {
          // Reject pending promises on error
          inflight.get(_key).forEach(([, reject]) => reject(error))
          inflight.delete(_key)
          throw error
        })
    } catch (error) {
      inflight.delete(_key)
      return Promise.reject(error)
    }

  }
}
