/**
 * timeout directive - sets execution timeout
 */

import type { ConfigDirective } from "./types.js"

export const timeoutDirective: ConfigDirective = {
  type: "config",
  name: "timeout",
  description: "Override the default execution timeout",
  handler: (_snippet, directive, _context) => {
    const timeoutValue = typeof directive.args === "number"
      ? directive.args
      : parseInt(String(directive.args), 10)

    return {
      timeout: timeoutValue
    }
  }
}
