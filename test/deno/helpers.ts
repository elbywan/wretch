import * as assertImport from "@std/assert"

export const expect = (actual: any) => ({
  toBe: (expected: unknown) => assertImport.assertEquals(actual, expected),
  toEqual: (expected: unknown) => assertImport.assertEquals(actual, expected),
  toBeNull: () => assertImport.assertEquals(actual, null),
  toBeTruthy: () => assertImport.assert(actual),
  toBeUndefined: () => assertImport.assertEquals(actual, undefined),
  toBeGreaterThanOrEqual: (expected: any) => {
    assertImport.assert(typeof actual === "number" && typeof expected === "number")
    assertImport.assert(actual >= expected)
  },
  toStrictEqual: (expected: unknown) => assertImport.assertEquals(actual, expected),
  toMatchObject: (expected: any) => {
    for (const key in expected) {
      const expectedValue = expected[key]
      const actualValue = actual[key]

      if (expectedValue instanceof Uint8Array) {
        if (actualValue && actualValue.type === "Buffer" && Array.isArray(actualValue.data)) {
          assertImport.assertEquals(actualValue.data, Array.from(expectedValue))
        } else {
          assertImport.assertEquals(Array.from(actualValue), Array.from(expectedValue))
        }
      } else if (typeof expectedValue === "object" && expectedValue !== null && !Array.isArray(expectedValue)) {
        if (expectedValue.type === "Buffer" && expectedValue.data instanceof Uint8Array) {
          assertImport.assertEquals(actualValue.type, "Buffer")
          assertImport.assertEquals(actualValue.data, Array.from(expectedValue.data))
        } else {
          assertImport.assertEquals(actualValue, expectedValue)
        }
      } else {
        assertImport.assertEquals(actualValue, expectedValue)
      }
    }
  }
})

export const assert = {
  ...assertImport,
  rejects: async (
    fn: () => Promise<unknown>,
    validator?: (error: unknown) => boolean
  ) => {
    try {
      await fn()
      throw new Error("Expected promise to reject")
    } catch (error) {
      if (validator && !validator(error)) {
        throw new Error("Validator returned false")
      }
    }
  }
}

export const fs = {
  openAsBlob: async (path: string) => {
    const file = await Deno.open(path, { read: true })
    const fileInfo = await file.stat()
    const buffer = new Uint8Array(fileInfo.size)
    await file.read(buffer)
    file.close()
    return new Blob([buffer])
  }
}
