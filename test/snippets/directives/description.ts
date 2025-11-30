/**
 * description directive
 */

import type { ControlDirective } from "./types.js"

export const description: ControlDirective = {
  type: "control",
  name: "description",
  handler: () => {
    // Description is purely for documentation, doesn't affect execution
    return null
  }
}
