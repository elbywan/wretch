import type { Wretch } from "./core.js"

export type { Wretch } from "./core.js"
export type { Config } from "./config.js"
export type { WretchResponseChain } from "./resolver.js"
export type { ConfiguredMiddleware, FetchLike, Middleware } from "./middleware.js"
/**
 * Fetch Request options with additional properties.
 */
export type WretchOptions = Record<string, any>
/**
 * An Error enhanced with status, text and body.
 */
export type WretchError = Error & { status: number, response: WretchResponse, text?: string, json?: any }
/**
 * Callback provided to catchers on error. Contains the original wretch instance used to perform the request.
 */
export type WretchErrorCallback<T, C> = (error: WretchError, originalRequest: Wretch<T, C>) => any
/**
 * Fetch Response object with additional properties.
 */
export type WretchResponse = Response & { [key: string]: any }
/**
 * Callback provided to the defer function allowing to chain deferred actions that will be stored and applied just before the request is sent.
 */
export type WretchDeferredCallback<T, C> = (wretch: T & Wretch<T, C>, url: string, options: WretchOptions) => Wretch<T, C>
/**
 * An addon enhancing either the request or response chain (or both).
 */
export type WretchAddon<W extends unknown, R extends unknown = unknown> = {
  beforeRequest?<T, C>(wretch: Wretch<T, C>, options: WretchOptions): void,
  wretch?: W,
  resolver?: R
}

