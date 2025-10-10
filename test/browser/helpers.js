// Browser-compatible assert helpers that match node:assert API
class AssertionError extends Error {
  constructor(message) {
    super(message)
    this.name = "AssertionError"
  }
}

function deepEqual(actual, expected) {
  if (actual === expected) return true
  if (actual == null || expected == null) return false
  if (actual.constructor !== expected.constructor) return false
  
  if (actual instanceof Date) {
    return actual.getTime() === expected.getTime()
  }
  
  if (actual instanceof RegExp) {
    return actual.toString() === expected.toString()
  }
  
  if (typeof actual !== "object") return actual === expected
  
  const keysA = Object.keys(actual)
  const keysB = Object.keys(expected)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(actual[key], expected[key])) return false
  }
  
  return true
}

export const expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new AssertionError(`Expected ${actual} to be ${expected}`)
    }
  },
  toEqual: (expected) => {
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
  toBeGreaterThanOrEqual: (expected) => {
    if (!(actual >= expected)) {
      throw new AssertionError(`Expected ${actual} to be >= ${expected}`)
    }
  },
  toStrictEqual: (expected) => {
    if (!deepEqual(actual, expected)) {
      throw new AssertionError(`Expected ${JSON.stringify(actual)} to strictly equal ${JSON.stringify(expected)}`)
    }
  },
})
