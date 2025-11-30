/**
 * expect-error directive
 */

import type { AssertionDirective } from "./types.js"

export const expectError: AssertionDirective = {
  type: "assertion",
  name: "expect-error",
  handler: (executionResult, directive) => {
    if (!executionResult.error) {
      return {
        passed: false,
        message: "Expected snippet to throw an error, but it succeeded",
      }
    }

    if (typeof directive.args === "string") {
      const expectedMessage = directive.args
      if (!executionResult.error.message.includes(expectedMessage)) {
        return {
          passed: false,
          message: `Expected error message to include "${expectedMessage}"`,
          expected: expectedMessage,
          actual: executionResult.error.message,
        }
      }
    }

    return { passed: true }
  }
}
