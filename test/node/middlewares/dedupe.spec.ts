import * as http from "http"
import wretch, { WretchOptions } from "../../../src"
import { dedupe } from "../../../src/middlewares"
import { mock } from "./mock"

export default describe("Dedupe Middleware", () => {
  const PORT = 0
  let server: http.Server | null = null
  let logs: any[] = []

  const log = (url: string, options: WretchOptions) => {
    logs.push([url, options.method])
  }

  const baseAddress = () => {
    const { address, port } = (server as any).address()
    return "http://" + address + ":" + port
  }

  beforeAll(done => {
    server = http.createServer((req, res) => {
      req.pipe(res)
    })
    server.listen(PORT, "127.0.0.1")
    server.once("listening", () => {
      done()
    })
    server.once("error", () => {
      done()
    })
  })

  afterAll(() => {
    server?.close()
  })

  beforeEach(() => {
    logs = []
  })

  it("should prevent sending multiple requests", async () => {
    const w = wretch(baseAddress()).polyfills({ fetch: mock(log) }).middlewares([dedupe()])
    const results = await Promise.all([
      w.get("/one").res(),
      w.get("/one").res(),
      w.get("/one").res(),
      w.get("/two").res(),
      w.get("/two").res(),
      w.get("/three").res(),
      w.post("body", "/one").res(),
      w.post("body", "/one").res(),
    ])

    expect(logs).toEqual([
      [baseAddress() + "/one", "GET"],
      [baseAddress() + "/two", "GET"],
      [baseAddress() + "/three", "GET"],
      [baseAddress() + "/one", "POST"],
      [baseAddress() + "/one", "POST"]
    ])

    results.forEach((result, i) => {
      expect(result).toMatchObject({
        url: baseAddress() + "/" + ((i < 3 || i > 5) ? "one" : i < 5 ? "two" : "three"),
        status: 200,
        statusText: "OK",
      })
    })
  })

  it("should skip some requests", async () => {
    const w = wretch(baseAddress()).polyfills({ fetch: mock(log) }).middlewares([dedupe({
      skip: (url, options) => { return options.skip || url.endsWith("/toto") }
    })])
    await Promise.all([
      w.get("/one").res(),
      w.get("/one").res(),
      w.get("/one").res(),
      w.options({ skip: true }).get("/one").res(),
      w.get("/toto").res(),
      w.get("/toto").res()
    ])

    expect(logs).toEqual([
      [baseAddress() + "/one", "GET"],
      [baseAddress() + "/one", "GET"],
      [baseAddress() + "/toto", "GET"],
      [baseAddress() + "/toto", "GET"],
    ])
  })

  it("should key requests", async () => {
    const w = wretch(baseAddress()).polyfills({ fetch: mock(log) }).middlewares([dedupe({
      key: () => { return "/same-key" }
    })])

    const results = await Promise.all([
      w.get("/one").res(),
      w.get("/two").res(),
      w.get("/three").res()
    ])

    expect(logs).toEqual([
      [baseAddress() + "/one", "GET"]
    ])

    results.forEach((result, i) => {
      expect(result).toMatchObject({
        url: baseAddress() + "/one",
        status: 200,
        statusText: "OK",
      })
    })
  })

  it("should allow custom resolvers", async () => {
    const w = wretch(baseAddress()).polyfills({ fetch: mock(log) }).middlewares([dedupe({
      resolver: res => res
    })])

    const results = await Promise.all([
      w.get("/one").res(),
      w.get("/one").res(),
      w.get("/one").res()
    ])

    expect(results[0]).toStrictEqual(results[1])
    expect(results[0]).toStrictEqual(results[2])
  })
})
