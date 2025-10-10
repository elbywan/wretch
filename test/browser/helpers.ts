class AssertionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AssertionError"
  }
}

function deepEqual(actual: unknown, expected: unknown): boolean {
  if (actual === expected) return true
  if (actual == null || expected == null) return false

  if (typeof actual !== "object" || typeof expected !== "object") {
    return actual === expected
  }

  if (actual.constructor !== expected.constructor) return false

  if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime()
  }

  if (actual instanceof RegExp && expected instanceof RegExp) {
    return actual.toString() === expected.toString()
  }

  const keysA = Object.keys(actual)
  const keysB = Object.keys(expected)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual((actual as Record<string, unknown>)[key], (expected as Record<string, unknown>)[key])) return false
  }

  return true
}

export const expect = <T>(actual: T) => ({
  toBe: (expected: T) => {
    if (actual !== expected) {
      throw new AssertionError(`Expected ${actual} to be ${expected}`)
    }
  },
  toEqual: (expected: T) => {
    if (!deepEqual(actual, expected)) {
      throw new AssertionError(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`)
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new AssertionError(`Expected ${actual} to be null`)
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new AssertionError(`Expected ${actual} to be truthy`)
    }
  },
  toBeUndefined: () => {
    if (actual !== undefined) {
      throw new AssertionError(`Expected ${actual} to be undefined`)
    }
  },
  toBeGreaterThanOrEqual: (expected: number) => {
    if (typeof actual !== "number") {
      throw new AssertionError(`Expected ${actual} to be a number`)
    }
    if (!(actual >= expected)) {
      throw new AssertionError(`Expected ${actual} to be >= ${expected}`)
    }
  },
  toStrictEqual: (expected: T) => {
    if (!deepEqual(actual, expected)) {
      throw new AssertionError(`Expected ${JSON.stringify(actual)} to strictly equal ${JSON.stringify(expected)}`)
    }
  },
})

export const assert = {
  rejects: async (fn: () => Promise<unknown>, validator?: (error: unknown) => boolean) => {
    let didReject = false
    let error: unknown = null

    try {
      await fn()
    } catch (e) {
      didReject = true
      error = e
    }

    if (!didReject) {
      throw new AssertionError("Expected promise to reject but it resolved")
    }

    if (validator && !validator(error)) {
      throw new AssertionError("Promise rejected but validator returned false")
    }
  }
}

export const fs = {
  openAsBlob: async (path: string): Promise<Blob> => {
    const response = await fetch(path)
    return response.blob()
  }
}
