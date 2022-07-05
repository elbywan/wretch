import { WretchOptions } from "./types.js"
import { WretchResponse } from "./types.js"

/**
 * Shape of a typical middleware.
 * Expects options and returns a ConfiguredMiddleware that can then be registered using the .middlewares function.
 */
export type Middleware = (options?: { [key: string]: any }) => ConfiguredMiddleware
/**
 * A ready to use middleware which is called before the request is sent.
 * Input is the next middleware in the chain, then url and options.
 * Output is a promise.
 */
export type ConfiguredMiddleware = (next: FetchLike) => FetchLike
/**
 * Any function having the same shape as fetch().
 */
export type FetchLike = (url: string, opts: WretchOptions) => Promise<WretchResponse>

/**
 * @private @internal
 */
export const middlewareHelper = (middlewares: ConfiguredMiddleware[]) => (fetchFunction: FetchLike): FetchLike => {
  return middlewares.reduceRight((acc, curr) => curr(acc), fetchFunction) || fetchFunction
}
