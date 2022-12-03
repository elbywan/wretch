import { setOptions, setErrorType, setPolyfills } from "./config.js"
import { core } from "./core.js"
import * as Addons from "./addons/index.js"
import { WretchError } from "./resolver.js"

function factory(_url = "", _options = {}) {
  return { ...core, _url, _options }
    .addon(Addons.abortAddon())
    .addon(Addons.formDataAddon)
    .addon(Addons.formUrlAddon)
    .addon(Addons.perfsAddon())
    .addon(Addons.queryStringAddon)
    .addon(Addons.progressAddon())
}

factory["default"] = factory
factory.options = setOptions
factory.errorType = setErrorType
factory.polyfills = setPolyfills
factory.WretchError = WretchError

export default factory
