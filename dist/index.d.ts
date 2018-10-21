import { Wretcher } from "./wretcher";
declare const factory: typeof Wretcher.factory;
export { Wretcher, WretcherOptions } from "./wretcher";
export { WretcherResponse, WretcherError, WretcherErrorCallback, ResponseChain } from "./resolver";
export { Middleware, ConfiguredMiddleware, FetchLike } from "./middleware";
/**
 * Return a fresh Wretcher instance.
 */
export default factory;
