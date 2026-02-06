export function extractContentType(headers: HeadersInit = {}): string | undefined {
  const normalizedHeaders = headers instanceof Array ? Object.fromEntries(headers) : headers
  for (const k in normalizedHeaders) {
    if (k.toLowerCase() === "content-type") return normalizedHeaders[k]
  }
}

export function isLikelyJsonMime(value: string): boolean {
  return /^application\/.*json/.test(value)
}

export const mix = (one: object, two: object, mergeArrays = false) => {
  const acc = { ...one }
  for (const key in two) {
    if (!Object.prototype.hasOwnProperty.call(two, key)) continue
    const value = one[key]
    const newValue = two[key]
    acc[key] = Array.isArray(value) && Array.isArray(newValue) ?
      mergeArrays ? [...value, ...newValue] : newValue :
      typeof value === "object" && typeof newValue === "object" ?
        mix(value, newValue, mergeArrays) :
        newValue
  }
  return acc
}

export function splitUrlQuery(url: string) {
  const i = url.indexOf("?")
  return i === -1
    ? { path: url, query: "" }
    : { path: url.slice(0, i), query: url.slice(i) }
}

export function joinUrl(base: string, next: string) {
  if (!base) return next
  if (!next) return base
  return base.endsWith("/") && next.startsWith("/")
    ? base + next.slice(1)
    : base + next
}
