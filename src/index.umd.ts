import { setDefaults, setErrorType, setPolyfills } from "./config"
import { core } from "./core"
function factory(url = "", options = {}) {
  return core.clone({ url, options })
}

factory["default"] = factory
factory.defaults = setDefaults
factory.errorType = setErrorType
factory.polyfills = setPolyfills
export default factory