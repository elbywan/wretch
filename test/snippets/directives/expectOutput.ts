/**
 * expect-output directive
 */

import type { AssertionDirective } from "./types.js"

export const expectOutput: AssertionDirective = {
  type: "assertion",
  name: "expect-output",
  handler: (executionResult, directive) => {
    const output = executionResult.logs.join("\n")
    const expected = String(directive.args)

    if (!output.includes(expected)) {
      return {
        passed: false,
        message: `Expected output to include "${expected}"`,
        expected,
        actual: output,
      }
    }

    return { passed: true }
  }
}
