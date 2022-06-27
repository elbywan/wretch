import { setDefaults, setErrorType, setPolyfills } from "./config"
import { core } from "./core"

export type {
  Wretch,
  Config,
  ConfiguredMiddleware,
  FetchLike,
  Middleware,
  WretchResponseChain,
  WretchOptions,
  WretchError,
  WretchErrorCallback,
  WretchResponse,
  WretchDeferredCallback,
  WretchResolverAddon,
} from "./types"

function factory(url = "", options = {}) {
  return core.clone({ url, options })
}

factory["default"] = factory
factory.defaults = setDefaults
factory.errorType = setErrorType
factory.polyfills = setPolyfills
export default factory