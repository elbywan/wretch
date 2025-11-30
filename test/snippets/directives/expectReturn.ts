/**
 * expect-return directive
 */

import type { AssertionDirective } from "./types.js"

export const expectReturn: AssertionDirective = {
  type: "assertion",
  name: "expect-return",
  handler: (executionResult, directive) => {
    const expected = String(directive.args)

    // Handle undefined/null return values explicitly
    if (executionResult.returnValue === undefined || executionResult.returnValue === null) {
      return {
        passed: false,
        message: `Expected return value to include "${expected}", but got ${executionResult.returnValue}`,
        expected,
        actual: executionResult.returnValue,
      }
    }

    const returnValueStr = JSON.stringify(executionResult.returnValue)

    if (!returnValueStr.includes(expected)) {
      return {
        passed: false,
        message: `Expected return value to include "${expected}"`,
        expected,
        actual: returnValueStr,
      }
    }

    return { passed: true }
  }
}
