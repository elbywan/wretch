/**
 * expect-no-error directive
 */

import type { AssertionDirective } from "./types.js"

export const expectNoError: AssertionDirective = {
  type: "assertion",
  name: "expect-no-error",
  handler: executionResult => {
    if (executionResult.error) {
      return {
        passed: false,
        message: "Expected snippet to succeed, but it threw an error",
        actual: executionResult.error.message,
      }
    }

    return { passed: true }
  }
}
