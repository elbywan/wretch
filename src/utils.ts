export function extractContentType(headers: HeadersInit = {}): string | undefined {
  const normalizedHeaders = headers instanceof Array ? Object.fromEntries(headers) : headers
  for (const k in normalizedHeaders) {
    if (k.toLowerCase() === "content-type") return normalizedHeaders[k]
  }
}

export function normalizeHeaders(headers?: HeadersInit | null): Record<string, string> {
  if (!headers) return {}
  if (Array.isArray(headers)) return Object.fromEntries(headers)
  if ("entries" in headers && typeof headers.entries === "function")
    return Object.fromEntries((headers as Headers).entries())
  return headers as Record<string, string>
}

export function normalizeOptions<T extends { headers?: HeadersInit }>(options: T): T {
  return options && options.headers ? { ...options, headers: normalizeHeaders(options.headers) } : options
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
