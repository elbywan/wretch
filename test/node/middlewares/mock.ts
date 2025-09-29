export const mock = (cb, fetchFn = fetch) => {
  return (url, options) => {
    cb(url, options)
    return fetchFn(url, options)
  }
}