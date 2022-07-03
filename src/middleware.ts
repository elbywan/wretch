import { WretchOptions } from "./types.js"
import { WretchResponse } from "./types.js"

export type Middleware = (options?: { [key: string]: any }) => ConfiguredMiddleware
export type ConfiguredMiddleware = (next: FetchLike) => FetchLike
export type FetchLike = (url: string, opts: WretchOptions) => Promise<WretchResponse>

export const middlewareHelper = (middlewares: ConfiguredMiddleware[]) => (fetchFunction: FetchLike): FetchLike => {
  return middlewares.reduceRight((acc, curr) => curr(acc), fetchFunction) || fetchFunction
}
