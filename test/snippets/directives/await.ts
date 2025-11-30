/**
 * await directive - wraps code in async IIFE
 */

import type { TransformDirective } from "./types.js"

export const awaitDirective: TransformDirective = {
  type: "transform",
  name: "await",
  description: "Automatically wrap code in an async IIFE for top-level await",
  handler: (snippet, _directive) => {
    // Mark that this snippet needs async wrapping
    // The actual transformation happens in the transformer module
    return {
      code: snippet.code,
      modified: false // Transformation will be done by transformer
    }
  }
}
