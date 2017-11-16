import { Wretcher } from "./wretcher"

const factory = Wretcher.factory
factory["default"] = Wretcher.factory

/**
 * Return a fresh Wretcher instance.
 */
export default factory
