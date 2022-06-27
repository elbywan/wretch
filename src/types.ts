import type { Wretch } from "./core.js"

export type { Wretch } from "./core.js"
export type { Config } from "./config.js"
export type { ConfiguredMiddleware, FetchLike, Middleware } from "./middleware.js"
export type { WretchResponseChain } from "./resolver.js"
export type WretchOptions = Record<string, any>
export type WretchError = Error & { status: number, response: WretchResponse, text?: string, json?: any }
export type WretchErrorCallback<T, C> = (error: WretchError, originalRequest: Wretch<T, C>) => any
export type WretchResponse = Response & { [key: string]: any }
export type WretchDeferredCallback<T, C> = (wretcher: Wretch<T, C>, url: string, options: WretchOptions) => Wretch<T, C>
export type WretchResolverAddon<Addon extends unknown> = {
  init?<T, C>(wretch: Wretch<T, C>, options: WretchOptions): void
  addon: Addon
}
export type WretchAddon<W extends unknown, R extends unknown = unknown> = {
  beforeRequest?<T, C>(wretch: Wretch<T, C>, options: WretchOptions): void,
  wretch?: W,
  resolver?: R
}

