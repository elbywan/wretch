import { core } from "./core.js"
import * as Addons from "./addons/index.js"
import { WretchError } from "./resolver.js"

const factory = (_url = "", _options = {}) =>
  ({ ...core, _url, _options })
    .addon([
      Addons.abortAddon(),
      Addons.basicAuthAddon,
      Addons.formDataAddon,
      Addons.formUrlAddon,
      Addons.perfsAddon(),
      Addons.queryStringAddon,
      Addons.progressAddon()
    ])

factory["default"] = factory
factory.WretchError = WretchError

export default factory
