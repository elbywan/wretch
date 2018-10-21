import { Wretcher } from "./wretcher"

const factory = Wretcher.factory
factory["default"] = Wretcher.factory

/* Export typescript types */
export {
    Wretcher,
    WretcherOptions
} from "./wretcher"
export {
    WretcherResponse,
    WretcherError,
    WretcherErrorCallback,
    ResponseChain
} from "./resolver"

export {
    Middleware,
    ConfiguredMiddleware,
    FetchLike
} from "./middleware"

/**
 * Return a fresh Wretcher instance.
 */
export default factory
