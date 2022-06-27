import * as Constants from "./constants"

export function extractContentType(headers: HeadersInit = {}): string | undefined {
  return Object.entries(headers).find(([k]) =>
    k.toLowerCase() === Constants.CONTENT_TYPE_HEADER.toLowerCase()
  )?.[1]
}

export function isLikelyJsonMime(value: string): boolean {
  return /^application\/.*json.*/.test(value)
}

export const mix = function (one: object, two: object, mergeArrays: boolean = false) {
  if (!one || !two || typeof one !== "object" || typeof two !== "object")
    return one

  const clone = { ...one }
  for (const prop in two) {
    if (two.hasOwnProperty(prop)) {
      if (two[prop] instanceof Array && one[prop] instanceof Array) {
        clone[prop] = mergeArrays ? [...one[prop], ...two[prop]] : two[prop]
      } else if (typeof two[prop] === "object" && typeof one[prop] === "object") {
        clone[prop] = mix(one[prop], two[prop], mergeArrays)
      } else {
        clone[prop] = two[prop]
      }
    }
  }

  return clone
}
