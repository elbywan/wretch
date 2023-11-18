import { CONTENT_TYPE_HEADER } from "./constants.js"

export function extractContentType(headers: Record<string, string> = {}): string | undefined {
  return Object.entries(headers).find(([k]) =>
    k.toLowerCase() === CONTENT_TYPE_HEADER.toLowerCase()
  )?.[1]
}

export function isLikelyJsonMime(value: string): boolean {
  return /^application\/.*json.*/.test(value)
}

export const mix = function (one: object, two: object, mergeArrays: boolean = false) {
  return Object.entries(two).reduce((acc, [key, newValue]) => {
    const value = one[key]
    if (Array.isArray(value) && Array.isArray(newValue)) {
      acc[key] = mergeArrays ? [...value, ...newValue] : newValue
    } else if (typeof value === "object" && typeof newValue === "object") {
      acc[key] = mix(value, newValue, mergeArrays)
    } else {
      acc[key] = newValue
    }

    return acc
  }, { ...one })
}
