export const mock = (cb, fetch = globalThis.fetch) => {
  return (url, options) => {
    cb(url, options)
    return fetch(url, options)
  }
}

export const fetchPolyfill = (): () => Promise<any> => (): Promise<any> => Promise.resolve({ ok: true })