import { setOptions, setFetchPolyfill } from "./config.js"
import { core } from "./core.js"
import * as Addons from "./addons/index.js"
import { WretchError } from "./resolver.js"

function factory(_url = "", _options = {}) {
  return { ...core, _url, _options }
    .addon(Addons.abortAddon())
    .addon(Addons.basicAuthAddon)
    .addon(Addons.formDataAddon)
    .addon(Addons.formUrlAddon)
    .addon(Addons.perfsAddon())
    .addon(Addons.queryStringAddon)
    .addon(Addons.progressAddon())
}

factory["default"] = factory
factory.options = setOptions
factory.fetchPolyfill = setFetchPolyfill
factory.WretchError = WretchError

export default factory
