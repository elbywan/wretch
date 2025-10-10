import * as http from "http"
import { describe, it, before, after, beforeEach } from "node:test"
import wretch, { WretchOptions } from "../../../src"
import { throttlingCache } from "../../../src/middlewares"
import { mock } from "./mock"
import { expect } from "../helpers"

export default describe("Throttling Cache Middleware", () => {
  const PORT = 5001
  let server: http.Server | null = null
  let logs: any[] = []

  const log = (url: string, options: WretchOptions) => {
    logs.push([url, options.method])
  }

  const baseAddress = () => {
    const { address, port } = (server as any).address()
    return "http://" + address + ":" + port
  }
  const base = () => wretch(baseAddress()).fetchPolyfill(mock(log))

  before(async () => {
    await new Promise<void>((resolve, reject) => {
      server = http.createServer((req, res) => {
        req.pipe(res)
      })
      server.listen(PORT, "127.0.0.1")
      server.once("listening", () => {
        resolve()
      })
      server.once("error", err => {
        reject(err)
      })
    })
  })

  after(() => {
    server?.close()
  })

  beforeEach(() => {
    logs = []
  })

  it("should dedupe and cache requests", async () => {
    const w = base().middlewares([throttlingCache({
      throttle: 500
    })])
    const results = await Promise.all([
      w.get("/one").res(),
      w.get("/one").res(),
      w.get("/one").res(),
      w.get("/two").res(),
      w.get("/two").res(),
      w.get("/three").res(),
    ])

    expect(logs).toEqual([
      [baseAddress() + "/one", "GET"],
      [baseAddress() + "/two", "GET"],
      [baseAddress() + "/three", "GET"],
    ])

    results.forEach((result, i) => {
      expect(result).toMatchObject({
        url: baseAddress() + "/" + (i < 3 ? "one" : i < 5 ? "two" : "three"),
        status: 200,
        statusText: "OK",
      })
    })

    logs = []

    await new Promise(resolve => setTimeout(resolve, 500))
    await w.get("/one").res()
    expect(logs).toEqual([
      [baseAddress() + "/one", "GET"],
    ])
  })

  it("should skip some requests", async () => {
    const w = base().middlewares([throttlingCache({
      skip(url) { return url.endsWith("/two") }
    })])
    await Promise.all([
      w.get("/one").res(),
      w.get("/one").res(),
      w.get("/one").res(),
      w.get("/two").res(),
      w.get("/two").res(),
      w.get("/three").res(),
    ])

    expect(logs).toEqual([
      [baseAddress() + "/one", "GET"],
      [baseAddress() + "/two", "GET"],
      [baseAddress() + "/two", "GET"],
      [baseAddress() + "/three", "GET"],
    ])
  })

  it("should be able to programtically customize the cache keys", async () => {
    const defaultMiddleware = throttlingCache()
    const wDefault = base().middlewares([defaultMiddleware])
    const customMiddleware = throttlingCache({
      key(url, opts) {
        return url + "$" + opts.method
      }
    })
    const wCustom = base().middlewares([customMiddleware])

    const promises = Promise.all([
      wDefault.url("/url").get().res(),
      wCustom.url("/url").get().res()
    ])

    const defaultKey = "GET@" + baseAddress() + "/url"
    const customKey = baseAddress() + "/url$GET"

    expect(defaultMiddleware.throttling.has(defaultKey)).toBe(true)
    expect(customMiddleware.throttling.has(customKey)).toBe(true)
    expect(defaultMiddleware.inflight.has(defaultKey)).toBe(true)
    expect(customMiddleware.inflight.has(customKey)).toBe(true)

    await promises

    expect(defaultMiddleware.throttling.has(defaultKey)).toBe(true)
    expect(customMiddleware.throttling.has(customKey)).toBe(true)
    expect(defaultMiddleware.inflight.has(defaultKey)).toBe(false)
    expect(customMiddleware.inflight.has(customKey)).toBe(false)

    await new Promise(resolve => setTimeout(resolve, 1000))

    expect(defaultMiddleware.throttling.has(defaultKey)).toBe(false)
    expect(customMiddleware.throttling.has(customKey)).toBe(false)
  })

  it("should be able to programmatically empty the cache", async () => {
    const middleware = throttlingCache({
      clear(_, options) {
        return options.clear
      }
    })
    const w = base().middlewares([middleware])
    const p0 = w.get("/zero").res()
    const p1 = w.get("/one").res()
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(false)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(middleware.cache.size).toBe(2)
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(true)
    const p2 = w.get("/one").res()
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(true)
    expect(middleware.cache.size).toBe(2)
    const p3 = w.options({ clear: true }).get("/one").res()
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(false)
    expect(middleware.cache.size).toBe(0)
    await Promise.all([p0, p1, p2, p3])
  })

  it("should be able the programmatically invalidate cache entries", async () => {
    const middleware = throttlingCache({
      invalidate(url) {
        if (url.endsWith("/invalidate")) {
          return /\/one$/
        }
      },
      skip(url) { return url.endsWith("/invalidate") }
    })
    const w = base().middlewares([middleware])
    const p0 = w.get("/zero").res()
    const p1 = w.get("/one").res()
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(false)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(middleware.cache.size).toBe(2)
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(true)
    const p2 = w.get("/one").res()
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(true)
    expect(middleware.cache.size).toBe(2)
    const p3 = w.get("/invalidate").res()
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(false)
    expect(middleware.cache.size).toBe(1)
    await Promise.all([p0, p1, p2, p3])
  })

  it("should be able to cache a request conditionally", async () => {
    const middleware = throttlingCache({
      condition(response) {
        return response.url.endsWith("/one")
      }
    })
    const w = base().middlewares([middleware])
    const p0 = w.get("/zero").res()
    const p1 = w.get("/one").res()
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(false)
    expect(middleware.cache.has("GET@" + baseAddress() + "/zero")).toBe(false)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(middleware.cache.size).toBe(1)
    expect(middleware.cache.has("GET@" + baseAddress() + "/zero")).toBe(false)
    expect(middleware.cache.has("GET@" + baseAddress() + "/one")).toBe(true)
    await Promise.all([p0, p1])

  })

  it("should mark a cached response", async () => {
    const middleware = throttlingCache({
      condition(response) {
        return response.url.endsWith("/one")
      },
      flagResponseOnCacheHit: "__marked"
    })
    const w = base().middlewares([middleware])
    const firstWave = await Promise.all([
      w.get("/zero").res(),
      w.get("/one").res()
    ])
    const secondWave = await Promise.all([
      w.get("/zero").res(),
      w.get("/one").res()
    ])
    expect(firstWave.every(response => response["__marked"] === undefined)).toBe(true)
    expect(secondWave[0]["__marked"]).toBe(undefined)
    expect(secondWave[1]["__marked"]).toBe("GET@" + baseAddress() + "/one")
  })
})
