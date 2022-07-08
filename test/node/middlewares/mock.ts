import nodeFetch from "node-fetch"

export const mock = (cb, fetch = nodeFetch) => {
  return (url, options) => {
    cb(url, options)
    return fetch(url, options)
  }
}