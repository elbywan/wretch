import { setDefaults, setErrorType, setPolyfills } from "./config.js"
import { core } from "./core.js"
import * as Addons from "./addons/index.js"

function factory(_url = "", _options = {}) {
  return core
    .clone({ _url, _options })
    .addon(Addons.abortAddon())
    .addon(Addons.formDataAddon)
    .addon(Addons.formUrlAddon)
    .addon(Addons.perfsAddon())
    .addon(Addons.queryStringAddon)
}

factory["default"] = factory
factory.defaults = setDefaults
factory.errorType = setErrorType
factory.polyfills = setPolyfills
export default factory