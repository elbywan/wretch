/**
 * expect-return-json directive
 */

import type { AssertionDirective } from "./types.js"
import { parseAssertionSpec, executeAssertion } from "../assertions.js"

export const expectReturnJson: AssertionDirective = {
  type: "assertion",
  name: "expect-return-json",
  handler: (executionResult, directive) => {
    const spec = parseAssertionSpec(directive.args as string | Record<string, unknown>)
    return executeAssertion(spec.type, executionResult.returnValue, spec.args)
  }
}
