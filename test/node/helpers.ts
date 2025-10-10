import * as assert from "node:assert"

export const expect = (actual: unknown) => ({
  toBe: (expected: unknown) => assert.strictEqual(actual, expected),
  toEqual: (expected: unknown) => assert.deepStrictEqual(actual, expected),
  toBeNull: () => assert.strictEqual(actual, null),
  toBeTruthy: () => assert.ok(actual),
  toBeUndefined: () => assert.strictEqual(actual, undefined),
  toBeGreaterThanOrEqual: (expected: unknown) => assert.ok(actual >= expected),
  toStrictEqual: (expected: unknown) => assert.deepStrictEqual(actual, expected),
  toMatchObject: (expected: object) => {
    for (const key in expected) {
      const expectedValue = expected[key]
      const actualValue = actual[key]

      if (Buffer.isBuffer(expectedValue)) {
        if (actualValue && actualValue.type === "Buffer" && Array.isArray(actualValue.data)) {
          assert.deepStrictEqual(actualValue.data, Array.from(expectedValue))
        } else {
          assert.deepStrictEqual(Array.from(actualValue), Array.from(expectedValue))
        }
      } else if (typeof expectedValue === "object" && expectedValue !== null && !Array.isArray(expectedValue)) {
        if (expectedValue.type === "Buffer" && Buffer.isBuffer(expectedValue.data)) {
          assert.strictEqual(actualValue.type, "Buffer")
          assert.deepStrictEqual(actualValue.data, Array.from(expectedValue.data))
        } else {
          assert.deepStrictEqual(actualValue, expectedValue)
        }
      } else {
        assert.strictEqual(actualValue, expectedValue)
      }
    }
  }
})
