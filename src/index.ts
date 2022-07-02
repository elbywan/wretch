import { setDefaults, setErrorType, setPolyfills } from "./config.js"
import { core } from "./core.js"

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

function factory(_url = "", _options = {}) {
  return core.clone({ _url, _options })
}

factory["default"] = factory
factory.defaults = setDefaults
factory.errorType = setErrorType
factory.polyfills = setPolyfills
export default factory