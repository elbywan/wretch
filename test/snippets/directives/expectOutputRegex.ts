/**
 * expect-output-regex directive
 */

import type { AssertionDirective } from "./types.js"

export const expectOutputRegex: AssertionDirective = {
  type: "assertion",
  name: "expect-output-regex",
  handler: (executionResult, directive) => {
    const output = executionResult.logs.join("\n")
    const pattern = directive.args as RegExp

    if (!pattern.test(output)) {
      return {
        passed: false,
        message: `Expected output to match ${pattern}`,
        expected: pattern,
        actual: output,
      }
    }

    return { passed: true }
  }
}
