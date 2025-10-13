import type { ConfiguredMiddleware, FetchLike } from "./types.js"

/**
 * @private @internal
 */
export const middlewareHelper = (middlewares: ConfiguredMiddleware[]) => (fetchFunction: FetchLike): FetchLike =>
  middlewares.reduceRight((acc, curr) => curr(acc), fetchFunction)
