import type { Config, ConfiguredMiddleware, Wretch, WretchAddon } from "../types.js"

function utf8ToBase64(input: string) {
  const utf8Bytes = new TextEncoder().encode(input)
  return btoa(String.fromCharCode(...utf8Bytes))
}

export interface BasicAuthAddon {
  /**
   * Sets the `Authorization` header to `Basic ` + <base64 encoded credentials>.
   * Additionally, allows using URLs with credentials in them.
   *
   * ```js
   * const user = "user"
   * const pass = "pass"
   *
   * // Automatically sets the Authorization header to "Basic " + <base64 encoded credentials>
   * wretch("...").addon(BasicAuthAddon).basicAuth(user, pass).get()
   *
   * // Allows using URLs with credentials in them
   * wretch(`https://${user}:${pass}@...`).addon(BasicAuthAddon).get()
   * ```
   *
   * @param username - Username to use for basic auth
   * @param password - Password to use for basic auth
   */
  basicAuth<T extends BasicAuthAddon, C, R>(
    this: T & Wretch<T, C, R>,
    username: string,
    password: string
  ): this
}

const makeBasicAuthMiddleware: (config: Config) => ConfiguredMiddleware = config => next => (url, opts) => {
  const _URL = config.polyfill("URL")
  const parsedUrl = _URL.canParse(url) ? new _URL(url) : null

  if (parsedUrl?.username || parsedUrl?.password) {
    const basicAuthBase64 = utf8ToBase64(
      `${decodeURIComponent(parsedUrl.username)}:${decodeURIComponent(parsedUrl.password)}`,
    )
    opts.headers = {
      ...opts.headers,
      Authorization: `Basic ${basicAuthBase64}`,
    }
    parsedUrl.username = ""
    parsedUrl.password = ""
    url = parsedUrl.toString()
  }

  return next(url, opts)
}


/**
 * Adds the ability to use basic auth with the `Authorization` header.
 *
 * ```js
 * import BasicAuthAddon from "wretch/addons/basicAuth"
 *
 * wretch().addon(BasicAuthAddon)
 * ```
 */
const basicAuth: WretchAddon<BasicAuthAddon> = {
  beforeRequest(wretch) {
    return wretch.middlewares([makeBasicAuthMiddleware(wretch._config)])
  },
  wretch: {
    basicAuth(username, password) {
      const basicAuthBase64 = utf8ToBase64(`${username}:${password}`)
      return this.auth(`Basic ${basicAuthBase64}`)
    },
  },
}

export default basicAuth
