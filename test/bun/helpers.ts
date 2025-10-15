import { expect as bunExpect } from "bun:test"

export const expect = (actual: any) => ({
  toBe: (expected: unknown) => bunExpect(actual).toBe(expected),
  toEqual: (expected: unknown) => bunExpect(actual).toEqual(expected),
  toBeNull: () => bunExpect(actual).toBeNull(),
  toBeTruthy: () => bunExpect(actual).toBeTruthy(),
  toBeUndefined: () => bunExpect(actual).toBeUndefined(),
  toBeGreaterThanOrEqual: (expected: any) => bunExpect(actual).toBeGreaterThanOrEqual(expected),
  toStrictEqual: (expected: unknown) => bunExpect(actual).toStrictEqual(expected),
  toMatchObject: (expected: any) => bunExpect(actual).toMatchObject(expected),
})

export const assert = {
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
    const file = Bun.file(path)
    return file
  }
}
