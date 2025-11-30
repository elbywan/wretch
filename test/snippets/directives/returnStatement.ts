/**
 * return-statement directive - adds return statement for variable
 */

import type { TransformDirective } from "./types.js"

export const returnStatementDirective: TransformDirective = {
  type: "transform",
  name: "return-statement",
  description: "Specify a custom variable to return when the snippet ends with a variable assignment",
  handler: (snippet, _directive) => {
    // Mark that this snippet needs return statement injection
    // The actual transformation happens in the transformer module
    return {
      code: snippet.code,
      modified: false // Transformation will be done by transformer
    }
  }
}
