/**
 * skip directive
 */

import type { ControlDirective } from "./types.js"

export const skip: ControlDirective = {
  type: "control",
  name: "skip",
  handler: (snippet, directive) => {
    const reason = typeof directive.args === "string"
      ? directive.args
      : "Skipped via directive"
    return { skip: true, reason }
  }
}
