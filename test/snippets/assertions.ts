/**
 * Assertion system for snippet testing.
 * Handles complex assertions for return values, outputs, and errors.
 */

import type { AssertionResult } from "./types.js"

/**
 * Create an assertion result
 */
function createAssertionResult(
  passed: boolean,
  message?: string,
  actual?: unknown,
  expected?: unknown
): AssertionResult {
  return { passed, message, actual, expected }
}

/**
 * Assert that a value includes a substring
 */
export function assertIncludes(actual: unknown, expected: string): AssertionResult {
  const actualStr = JSON.stringify(actual)
  const passed = actualStr.includes(expected)

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected value to include "${expected}", but got: ${actualStr}`,
    actualStr,
    expected
  )
}

/**
 * Assert that a value equals another value (shallow comparison)
 */
export function assertEquals(actual: unknown, expected: unknown): AssertionResult {
  const passed = actual === expected

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected ${JSON.stringify(expected)}, but got: ${JSON.stringify(actual)}`,
    actual,
    expected
  )
}

/**
 * Assert deep equality
 */
export function assertDeepEquals(actual: unknown, expected: unknown): AssertionResult {
  const passed = deepEquals(actual, expected)

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected deep equality.\nExpected: ${JSON.stringify(expected, null, 2)}\nActual: ${JSON.stringify(actual, null, 2)}`,
    actual,
    expected
  )
}

/**
 * Assert that a value matches a regex
 */
export function assertMatches(actual: unknown, pattern: RegExp): AssertionResult {
  const actualStr = typeof actual === "string" ? actual : JSON.stringify(actual)
  const passed = pattern.test(actualStr)

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected value to match ${pattern}, but got: ${actualStr}`,
    actualStr,
    pattern
  )
}

/**
 * Assert JSON path value
 * Simple implementation - supports basic paths like "user.name" or "items[0].id"
 */
export function assertJsonPath(
  actual: unknown,
  path: string,
  expected: unknown
): AssertionResult {
  try {
    const value = getJsonPathValue(actual, path)
    const passed = deepEquals(value, expected)

    return createAssertionResult(
      passed,
      passed
        ? undefined
        : `Expected value at path "${path}" to equal ${JSON.stringify(expected)}, but got: ${JSON.stringify(value)}`,
      value,
      expected
    )
  } catch (error) {
    return createAssertionResult(
      false,
      `Failed to evaluate path "${path}": ${(error as Error).message}`,
      actual,
      expected
    )
  }
}

/**
 * Assert that an object has a property
 */
export function assertHasProperty(actual: unknown, property: string): AssertionResult {
  if (typeof actual !== "object" || actual === null) {
    return createAssertionResult(
      false,
      `Expected an object, but got: ${typeof actual}`,
      actual,
      property
    )
  }

  const passed = property in actual

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected object to have property "${property}"`,
    actual,
    property
  )
}

/**
 * Assert that an array contains a value
 */
export function assertArrayContains(actual: unknown, expected: unknown): AssertionResult {
  if (!Array.isArray(actual)) {
    return createAssertionResult(
      false,
      `Expected an array, but got: ${typeof actual}`,
      actual,
      expected
    )
  }

  const passed = actual.some(item => deepEquals(item, expected))

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected array to contain ${JSON.stringify(expected)}, but got: ${JSON.stringify(actual)}`,
    actual,
    expected
  )
}

/**
 * Assert that an array has a specific length
 */
export function assertArrayLength(actual: unknown, expectedLength: number): AssertionResult {
  if (!Array.isArray(actual)) {
    return createAssertionResult(
      false,
      `Expected an array, but got: ${typeof actual}`,
      actual,
      expectedLength
    )
  }

  const passed = actual.length === expectedLength

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected array length to be ${expectedLength}, but got: ${actual.length}`,
    actual.length,
    expectedLength
  )
}

/**
 * Assert that a value is of a specific type
 */
export function assertType(actual: unknown, expectedType: string): AssertionResult {
  const actualType = typeof actual
  const passed = actualType === expectedType

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected type ${expectedType}, but got: ${actualType}`,
    actualType,
    expectedType
  )
}

/**
 * Assert that a value is truthy
 */
export function assertTruthy(actual: unknown): AssertionResult {
  const passed = !!actual

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected a truthy value, but got: ${JSON.stringify(actual)}`,
    actual,
    true
  )
}

/**
 * Assert that a value is falsy
 */
export function assertFalsy(actual: unknown): AssertionResult {
  const passed = !actual

  return createAssertionResult(
    passed,
    passed
      ? undefined
      : `Expected a falsy value, but got: ${JSON.stringify(actual)}`,
    actual,
    false
  )
}

/**
 * Deep equality check
 */
function deepEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true

  if (a === null || b === null) return a === b
  if (a === undefined || b === undefined) return a === b

  if (typeof a !== typeof b) return false

  if (typeof a !== "object") return a === b

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEquals(item, b[index]))
  }

  if (Array.isArray(a) || Array.isArray(b)) return false

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key =>
    deepEquals((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
  )
}

/**
 * Get value from object using a path like "user.name" or "items[0].id"
 */
function getJsonPathValue(obj: unknown, path: string): unknown {
  const parts = path.split(/\.|\[|\]/).filter(Boolean)
  let current: any = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      throw new Error(`Cannot read property "${part}" of ${current}`)
    }

    current = current[part]
  }

  return current
}

/**
 * Parse assertion spec from directive arguments
 * Examples:
 * - "userId" -> includes assertion
 * - "equals:123" -> equals assertion
 * - "matches:/pattern/" -> regex assertion
 * - "path:user.id value:123" -> JSON path assertion
 */
export function parseAssertionSpec(spec: string | Record<string, unknown>): {
  type: string
  args: unknown[]
} {
  if (typeof spec === "object") {
    // Handle object-style specs like { path: "user.id", value: 123 }
    if ("path" in spec && "value" in spec) {
      return { type: "json-path", args: [spec.path, spec.value] }
    }
    if ("type" in spec) {
      return { type: spec.type as string, args: [spec] }
    }
  }

  if (typeof spec === "string") {
    // Handle string-style specs
    if (spec.startsWith("equals:")) {
      const value = spec.substring(7)
      return { type: "equals", args: [tryParseJson(value)] }
    }

    if (spec.startsWith("matches:")) {
      const pattern = spec.substring(8)
      return { type: "matches", args: [new RegExp(pattern)] }
    }

    if (spec.startsWith("deep-equals:")) {
      const value = spec.substring(12)
      return { type: "deep-equals", args: [tryParseJson(value)] }
    }

    if (spec.startsWith("type:")) {
      const type = spec.substring(5)
      return { type: "type", args: [type] }
    }

    if (spec.startsWith("has-property:")) {
      const property = spec.substring(13)
      return { type: "has-property", args: [property] }
    }

    if (spec.startsWith("array-contains:")) {
      const value = spec.substring(15)
      return { type: "array-contains", args: [tryParseJson(value)] }
    }

    if (spec.startsWith("array-length:")) {
      const length = spec.substring(13)
      return { type: "array-length", args: [parseInt(length, 10)] }
    }

    // Default to includes
    return { type: "includes", args: [spec] }
  }

  return { type: "includes", args: [spec] }
}

/**
 * Try to parse a value as JSON, otherwise return as string
 */
function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

/**
 * Execute an assertion based on type
 */
export function executeAssertion(
  type: string,
  actual: unknown,
  args: unknown[]
): AssertionResult {
  switch (type) {
  case "includes":
    return assertIncludes(actual, args[0] as string)
  case "equals":
    return assertEquals(actual, args[0])
  case "deep-equals":
    return assertDeepEquals(actual, args[0])
  case "matches":
    return assertMatches(actual, args[0] as RegExp)
  case "json-path":
    return assertJsonPath(actual, args[0] as string, args[1])
  case "has-property":
    return assertHasProperty(actual, args[0] as string)
  case "array-contains":
    return assertArrayContains(actual, args[0])
  case "array-length":
    return assertArrayLength(actual, args[0] as number)
  case "type":
    return assertType(actual, args[0] as string)
  case "truthy":
    return assertTruthy(actual)
  case "falsy":
    return assertFalsy(actual)
  default:
    return createAssertionResult(
      false,
      `Unknown assertion type: ${type}`,
      actual,
      args
    )
  }
}
