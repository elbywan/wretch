/**
 * Directive registry - exports all directive handlers
 */

export * from "./types.js"
export { skip } from "./skip.js"
export { description } from "./description.js"
export { expectError } from "./expectError.js"
export { expectNoError } from "./expectNoError.js"
export { expectOutput } from "./expectOutput.js"
export { expectOutputRegex } from "./expectOutputRegex.js"
export { expectReturn } from "./expectReturn.js"
export { expectReturnJson } from "./expectReturnJson.js"
export { awaitDirective } from "./await.js"
export { timeoutDirective } from "./timeout.js"
export { returnStatementDirective } from "./returnStatement.js"

import type { AnyDirective } from "./types.js"
import { skip } from "./skip.js"
import { description } from "./description.js"
import { expectError } from "./expectError.js"
import { expectNoError } from "./expectNoError.js"
import { expectOutput } from "./expectOutput.js"
import { expectOutputRegex } from "./expectOutputRegex.js"
import { expectReturn } from "./expectReturn.js"
import { expectReturnJson } from "./expectReturnJson.js"
import { awaitDirective } from "./await.js"
import { timeoutDirective } from "./timeout.js"
import { returnStatementDirective } from "./returnStatement.js"

/**
 * All built-in directives
 */
export const allDirectives: AnyDirective[] = [
  skip,
  description,
  expectError,
  expectNoError,
  expectOutput,
  expectOutputRegex,
  expectReturn,
  expectReturnJson,
  awaitDirective,
  timeoutDirective,
  returnStatementDirective,
]

/**
 * Directives grouped by type
 */
export const directives = {
  control: [skip, description],
  assertion: [expectError, expectNoError, expectOutput, expectOutputRegex, expectReturn, expectReturnJson],
  transform: [awaitDirective, returnStatementDirective],
  config: [timeoutDirective],
}

/**
 * Get directive by name
 */
export function getDirectiveByName(name: string): AnyDirective | undefined {
  return allDirectives.find(d => d.name === name)
}
