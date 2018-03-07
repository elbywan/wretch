import { WretcherOptions } from "./wretcher"
import { WretcherResponse } from "./resolver"

export type Middleware = (options?: {[key: string]: any}) => ConfiguredMiddleware
export type ConfiguredMiddleware = (next: FetchLike) => FetchLike
export type FetchLike = (url: string, opts: WretcherOptions) => Promise<WretcherResponse>

export const middlewareHelper = (middlewares: ConfiguredMiddleware[]) => (fetchFunction: FetchLike): FetchLike => {
    return (
        middlewares.length === 0 ?
           fetchFunction :
        middlewares.length === 1 ?
            middlewares[0](fetchFunction) :
        middlewares.reduceRight((acc, curr, idx): any =>
            (idx === middlewares.length - 2) ? curr(acc(fetchFunction)) : curr(acc as any)
        )
    ) as FetchLike
}
