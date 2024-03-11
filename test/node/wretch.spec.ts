import nodeFetch from "node-fetch"
import * as FormData from "form-data"
import { AbortController, abortableFetch } from "abortcontroller-polyfill/dist/cjs-ponyfill"
import * as fs from "fs"
import { URLSearchParams } from "url"
import * as path from "path"
import wretch from "../../src"
import { mix } from "../../src/utils"

import AbortAddon from "../../src/addons/abort"
import BasicAuthAddon from "../../src/addons/basicAuth"
import FormDataAddon from "../../src/addons/formData"
import FormUrlAddon from "../../src/addons/formUrl"
import PerfsAddon from "../../src/addons/perfs"
import QueryStringAddon from "../../src/addons/queryString"

declare const global

import { performance, PerformanceObserver } from "perf_hooks"
// clearResourceTimings is read-only since node 18. Use `defineProperty` to force override it
// See https://github.com/facebook/jest/issues/2227#issuecomment-265005782
// tslint:disable-next-line: no-empty
Object.defineProperty(performance, "clearResourceTimings", { value: () => { } })

const _PORT = 9876
const _URL = `http://localhost:${_PORT}`

const allRoutes = (obj, type, action, body?) => Promise.all([
  obj.get("")[type](_ => _).then(action),
  obj.put(body, "")[type](action),
  obj.patch(body, "")[type](action),
  obj.post(body, "")[type](action),
  obj.delete("")[type](action),
])

const fetchPolyfill = (timeout: number | null = null) =>
  function (url, opts) {
    performance.mark(url + " - begin")
    const { fetch } = abortableFetch(nodeFetch) as any
    return fetch(url, opts).then(res => {
      performance.mark(url + " - end")
      const measure = () => performance.measure(res.url, url + " - begin", url + " - end")
      if (timeout)
        setTimeout(measure, timeout)
      else
        measure()
      return res
    })
  }

const duckImagePath = path.resolve(__dirname, "..", "assets", "duck.jpg")
const duckImage = fs.readFileSync(duckImagePath)

describe("Wretch", function () {

  beforeEach(() => {
    wretch.options({}, true)
    wretch.errorType("text")
  })

  it("should set and use non global polyfills", async function () {
    global["FormData"] = null
    global["URLSearchParams"] = null
    global["fetch"] = null

    expect(() => wretch("...").addon(QueryStringAddon).query({ a: 1, b: 2 })).toThrow("URLSearchParams is not defined")
    expect(() => wretch("...").addon(FormDataAddon).formData({ a: 1, b: 2 })).toThrow("FormData is not defined")
    expect(() => wretch("...").get()).toThrow("fetch is not defined")

    wretch.polyfills({
      fetch: fetchPolyfill(),
      FormData,
      URLSearchParams
    })

    await wretch(`${_URL}/text`).addon(PerfsAddon()).get().perfs(_ => fail("should never be called")).res()

    wretch.polyfills({
      fetch: fetchPolyfill(),
      FormData,
      URLSearchParams,
      performance,
      PerformanceObserver,
      AbortController
    }, true)
  })

  it("should perform crud requests and parse a text response", async function () {
    const init = wretch(`${_URL}/text`)
    const test = _ => expect(_).toBe("A text string")
    await allRoutes(init, "text", test)
    await allRoutes(init, "text", test, {})
  })

  it("should perform crud requests and parse a json response", async function () {
    const test = _ => expect(_).toEqual({ a: "json", object: "which", is: "stringified" })
    const init = wretch(`${_URL}/json`)
    await allRoutes(init, "json", test)
    await allRoutes(init, "json", test, {})
  })

  it("should perform crud requests and parse a blob response", async function () {
    const test = _ => expect(_.size).toBe(duckImage.length)
    const init = wretch(`${_URL}/blob`)
    await allRoutes(init, "blob", test)
    await allRoutes(init, "blob", test, {})
  })

  it("should not stringify a blob when the content-type is not json", async function () {
    expect((
      await wretch(`${_URL}/blob/roundTrip`, {
        // using 'xxx-' prefix because otherwise node-fetch sends an empty body
        headers: { "content-type": "application/xxx-octet-stream" }
      })
        .post(duckImage)
        .res(res => res["buffer"]() as Buffer))
      .compare(duckImage)
    ).toBe(0)

    // Headers are set in the options argument of the http method
    expect((
      await wretch(`${_URL}/blob/roundTrip`)
        .headers({ "content-type": "application/xxx-octet-stream" })
        .post(duckImage)
        .res(res => res["buffer"]() as Buffer)
    ).compare(duckImage)
    ).toBe(0)
  })

  it("should perform crud requests and parse an arrayBuffer response", async function () {
    const test = arrayBuffer => {
      const buffer = Buffer.alloc(arrayBuffer.byteLength)
      const view = new Uint8Array(arrayBuffer)
      for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i]
      }
      expect(buffer.equals(Buffer.from([0x00, 0x01, 0x02, 0x03]))).toBe(true)
    }
    const init = wretch(`${_URL}/arrayBuffer`)
    await allRoutes(init, "arrayBuffer", test)
    await allRoutes(init, "arrayBuffer", test, {})
  })

  it("should perform a plain text round trip", async function () {
    const text = "hello, server !"
    const roundTrip = await wretch(`${_URL}/text/roundTrip`).content("text/plain").body(text).post().text()
    expect(roundTrip).toBe(text)
    // Using shorthand
    const roundTrip2 = await wretch(`${_URL}/text/roundTrip`).content("text/plain").post(text).text()
    expect(roundTrip2).toBe(text)
  })

  it("should perform a json round trip", async function () {
    const jsonObject = { a: 1, b: 2, c: 3 }
    const roundTrip = await wretch(`${_URL}/json/roundTrip`).json(jsonObject).post().json()
    expect(roundTrip).toEqual(jsonObject)
    // Using shorthand
    const roundTrip2 = await wretch(`${_URL}/json/roundTrip`).post(jsonObject).json()
    expect(roundTrip2).toEqual(jsonObject)
    // Ensure that calling .json with the shorthand works
    const roundTrip3 = await wretch(`${_URL}/json/roundTrip`).json({}).post(jsonObject).json()
    expect(roundTrip3).toEqual(jsonObject)
    // Ensure that it preserves any content type set previously
    try {
      await wretch(`${_URL}/json/roundTrip`).content("bad/content").post(jsonObject).json()
      fail("should have thrown")
    } catch (e) { /* ignore */ }
    // Ensure that the charset is preserved.
    const headerWithCharset = "application/json; charset=utf-16"
    expect(wretch().content(headerWithCharset).json({})._options.headers["Content-Type"]).toBe(headerWithCharset)
  })

  it("should perform an url encoded form data round trip", async function () {
    const reference = "a=1&b=2&%20c=%203&d=%7B%22a%22%3A1%7D&e=1%20&e=2"
    const jsonObject = { "a": 1, "b": 2, " c": " 3", "d": { a: 1 }, "e": ["1 ", 2] }
    let roundTrip = await wretch(`${_URL}/urlencoded/roundTrip`).addon(FormUrlAddon).formUrl(reference).post().text()
    expect(roundTrip).toBe(reference)
    roundTrip = await wretch(`${_URL}/urlencoded/roundTrip`).addon(FormUrlAddon).formUrl(jsonObject).post().text()
    expect(roundTrip).toEqual(reference)
  })

  it("should send a FormData object", async function () {
    // Test with a nested object with an excluded field.
    let form: any = {
      hello: "world",
      duck: "Muscovy",
      duckImage: fs.createReadStream(duckImagePath),
      duckProperties: {
        beak: {
          color: "yellow"
        },
        nbOfLegs: 2,
        nullProp: null
      }
    }
    let decoded = await wretch(`${_URL}/formData/decode`)
      .addon(FormDataAddon)
      .formData(form, ["duckImage"])
      .post()
      .json()
    expect(decoded).toMatchObject({
      hello: "world",
      duck: "Muscovy",
      duckImage: {
        data: duckImage,
        type: "Buffer"
      },
      "duckProperties[beak][color]": "yellow",
      "duckProperties[nbOfLegs]": "2"
    })

    // Test with full nesting.
    form = {
      hello: "world",
      nested: {
        property: 1
      }
    }
    decoded = await wretch(`${_URL}/formData/decode`)
      .addon(FormDataAddon)
      .formData(form, true)
      .post()
      .json()
    expect(decoded).toMatchObject({
      hello: "world"
    })

    // Test without nesting.
    form = {
      hello: "world",
      // Unfortunately, form-data has issues casting objects to strings.
      // This means that we cannot test this properly for now…
      // See: https://github.com/form-data/form-data/pull/362
      // nested: {
      //     property: 1
      // }
    }
    decoded = await wretch(`${_URL}/formData/decode`)
      .addon(FormDataAddon)
      .formData(form)
      .post()
      .json()
    expect(decoded).toMatchObject({
      hello: "world"
    })

    // Test for arrays.
    const f = { arr: [1, 2, 3] }
    const d = await wretch(`${_URL}/formData/decode`).addon(FormDataAddon).formData(f).post().json()
    expect(d).toEqual({
      "arr": ["1", "2", "3"]
    })
  })

  it("should perform OPTIONS and HEAD requests", async function () {
    const optsRes = await wretch(_URL + "/options").opts().res()
    const optsRes2 = await wretch(_URL + "/options").opts("").res()
    expect(optsRes.headers.get("Allow")).toBe("OPTIONS")
    expect(optsRes2.headers.get("Allow")).toBe("OPTIONS")
    const headRes = await wretch(_URL + "/json").head().res()
    const headRes2 = await wretch(_URL + "/json").head("").res()
    expect(headRes.headers.get("content-type")).toBe("application/json")
    expect(headRes2.headers.get("content-type")).toBe("application/json")
  })

  it("should preserve existing headers when undefined or null is passed to .headers()", async function () {
    const headers = { "X-HELLO": "WORLD", "X-Y": "Z" }
    let req = wretch().headers({ "X-HELLO": "WORLD" })
    req = req.headers({ "X-Y": "Z" })
    expect(req._options.headers).toEqual(headers)
    req = req.headers(null as any)
    expect(req._options.headers).toEqual(headers)
    req = req.headers(undefined as any)
    expect(req._options.headers).toEqual(headers)
  })

  it("should catch common error codes", async function () {
    const w = wretch(_URL + "/")

    let check = 0
    await w.url("400").get().badRequest(_ => {
      expect(_.message).toBe("error code : 400")
      check++
    }).text(_ => expect(_).toBeNull())
    await w.url("401").get().unauthorized(_ => {
      expect(_.message).toBe("error code : 401")
      check++
    }).text(_ => expect(_).toBeNull())
    await w.url("403").get().forbidden(_ => {
      expect(_.message).toBe("error code : 403")
      check++
    }).text(_ => expect(_).toBeNull())
    await w.url("404").get().notFound(_ => {
      expect(_.message).toBe("error code : 404")
      check++
    }).text(_ => expect(_).toBeNull())
    await w.url("408").get().timeout(_ => {
      expect(_.message).toBe("error code : 408")
      check++
    }).text(_ => expect(_).toBeNull())
    await w.url("500").get().internalError(_ => {
      expect(_.message).toBe("error code : 500")
      check++
    }).text(_ => expect(_).toBeNull())
    expect(check).toBe(6)
  })

  it("should catch other error codes", async function () {
    let check = 0
    await wretch(`${_URL}/444`)
      .get()
      .notFound(_ => check++)
      .error(444, _ => check++)
      .unauthorized(_ => check++)
      .fetchError(_ => check++)
      .res(_ => expect(_).toBe(undefined))
    expect(check).toBe(1)

    check = 0
    await wretch(`${_URL}/444`)
      .polyfills({
        fetch: () => Promise.reject("Error")
      })
      .get()
      .notFound(_ => check++)
      .error(444, _ => check++)
      .unauthorized(_ => check++)
      .fetchError(_ => check--)
      .res(_ => expect(_).toBe(undefined))
    expect(check).toBe(-1)
  })

  it("should set and catch errors with global catchers", async function () {
    let check = 0
    const w = wretch(_URL)
      .polyfills({
        fetch: fetchPolyfill()
      })
      .catcher(404, _ => check++)
      .catcher(500, _ => check++)
      .catcher(400, _ => check++)
      .catcher(401, _ => check--)
      .catcher("FetchError", _ => check++)

    // +1 : 1
    await w.url("/text").get().res(_ => check++)
    // +0 : 1
    await w.url("/text").get().json(_ => check--)
    // +1 : 2
    await w.url("/400").get().res(_ => check--)
    // +1 : 3
    await w.url("/401").get().unauthorized(_ => check++).res(_ => check--)
    // +1 : 4
    await w.url("/404").get().res(_ => check--)
    // +1 : 5
    await w.url("/408").get().timeout(_ => check++).res(_ => check--)
    // +1 : 6
    await w.url("/418").get().res(_ => check--).catch(_ => "muted")
    // +1: 7
    await w.url("/500").get().res(_ => check--)

    expect(check).toBe(7)
  })

  it("should use the fallback catcher", async function () {
    let _404 = 0
    let fetchError = 0
    let fallback = 0

    const w = wretch(_URL)
      .polyfills({
        fetch: fetchPolyfill()
      })
      .catcher(404, _ => _404++)
      .catcherFallback(_ => fallback++)

    await w.url("/404").get().res(_ => fallback--)
    await w
      .polyfills({ fetch: () => Promise.reject() })
      .get()
      .fetchError(_ => fetchError++)
      .res(_ => fallback--)
    await w.url("/401").get().res(_ => fallback--)

    expect(_404).toBe(1)
    expect(fetchError).toBe(1)
    expect(fallback).toBe(1)
  })

  it("should capture the original request with resolvers/catchers", async function () {
    let check = 0
    const redirectedNotFound = await wretch(`${_URL}/404`)
      .get()
      .notFound((error, req) => {
        check++
        return req.url(`${_URL}/text`, true).get().text()
      }).text()
    expect(redirectedNotFound).toBe("A text string")

    const withNotFoundCatcher = wretch(`${_URL}/401`)
      .catcher(401, (err, req) => {
        check++
        return req.url(`${_URL}/text`, true).get().text()
      })

    const withNotFoundRedirect = wretch(`${_URL}/404`)
      .resolve(resolver => resolver.notFound((err, req) => {
        check++
        return req.url(`${_URL}/text`, true).get().text()
      }))

    expect(await withNotFoundCatcher.get().text()).toBe("A text string")
    expect(await withNotFoundRedirect.get().text()).toBe("A text string")
    expect(check).toBe(3)
  })

  it("should set global default fetch options", async function () {
    let rejected = await new Promise(res => wretch(`${_URL}/customHeaders`).get().badRequest(_ => {
      res(true)
    }).res(result => res(!result)))
    expect(rejected).toBeTruthy()
    wretch.options({
      headers: { "X-Custom-Header": "Anything" }
    }, true)
    rejected = await new Promise(res => wretch(`${_URL}/customHeaders`).get().badRequest(_ => {
      res(true)
    }).res(result => res(!result)))
    expect(rejected).toBeTruthy()
    wretch.options({
      headers: { "X-Custom-Header-2": "Anything" }
    })
    rejected = await new Promise(res => wretch(`${_URL}/customHeaders`).get().badRequest(_ => {
      res(true)
    }).res(result => res(!result)))
    // wretch.options("not an object" as any, true)
    expect(rejected).toBeTruthy()
    const accepted = await new Promise(res => wretch(`${_URL}/customHeaders`)
      .options({ headers: { "X-Custom-Header-3": "Anything" } }, false)
      .options({ headers: { "X-Custom-Header-4": "Anything" } })
      .get()
      .badRequest(_ => { res(false) })
      .res(result => res(!!result)))
    expect(accepted).toBeTruthy()
  })

  it("should allow url, query parameters & options modifications and return a fresh new Wretch object containing the change", async function () {
    const obj1 = wretch("...")
    const obj2 = obj1.url(_URL, true)
    expect(obj1["_url"]).toBe("...")
    expect(obj2["_url"]).toBe(_URL)
    const obj3 = obj1.options({ headers: { "X-test": "test" } })
    expect(obj3["_options"]).toEqual({ headers: { "X-test": "test" } })
    expect(obj1["_options"]).toEqual({})
    const obj4 = obj2.addon(QueryStringAddon).query({ a: "1!", b: "2" })
    expect(obj4["_url"]).toBe(`${_URL}?a=1%21&b=2`)
    expect(obj2["_url"]).toBe(_URL)
    const obj5 = obj4.query({ c: 6, d: [7, 8] })
    expect(obj4["_url"]).toBe(`${_URL}?a=1%21&b=2`)
    expect(obj5["_url"]).toBe(`${_URL}?a=1%21&b=2&c=6&d=7&d=8`)
    const obj6 = obj5.query("Literal[]=Query&String", true)
    expect(obj5["_url"]).toBe(`${_URL}?a=1%21&b=2&c=6&d=7&d=8`)
    expect(obj6["_url"]).toBe(`${_URL}?Literal[]=Query&String`)
    const obj7 = obj5.query("Literal[]=Query&String").url("/test")
    expect(obj5["_url"]).toBe(`${_URL}?a=1%21&b=2&c=6&d=7&d=8`)
    expect(obj7["_url"]).toBe(`${_URL}/test?a=1%21&b=2&c=6&d=7&d=8&Literal[]=Query&String`)
  })

  it("should set the Accept header", async function () {
    expect(await wretch(`${_URL}/accept`).get().text()).toBe("text")
    expect(await wretch(`${_URL}/accept`).accept("application/json").get().json()).toEqual({ json: "ok" })
  })

  describe("handling of the Authorization header", function () {
    it("should fail without using an Authorization header", async function () {
      try {
        await wretch(_URL + "/basicauth")
          .get()
          .res(_ => fail("Authenticated route should not respond without credentials."))
      } catch (e) {
        expect(e.status).toBe(401)
        expect(e.url).toBe(_URL + "/basicauth")
      }
    })

    it("should set the Authorization header using the .auth() method", async function () {
      const res = await wretch(_URL + "/basicauth")
        .auth("Basic d3JldGNoOnLDtmNrcw==")
        .get()
        .text()

      expect(res).toBe("ok")
    })

    it("should set the Authorization header using the BasicAuth addon's .basicAuth() method", async function () {
      const res = await wretch(_URL + "/basicauth")
        .addon(BasicAuthAddon)
        .basicAuth("wretch", "röcks")
        .get()
        .text()
  
      expect(res).toBe("ok")
    })

    it("should set the Authorization header using credentials from URL via the BasicAuth addon", async function () {
      const url = new URL(_URL)
      url.username = "wretch"
      url.password = "röcks"
      url.pathname = "/basicauth"
      const res = await wretch(url.toString())
        .addon(BasicAuthAddon)
        .get()
        .text()
  
      expect(res).toBe("ok")
    })
  })

  it("should change the parsing used in the default error handler", async function () {
    // Local
    await wretch(`${_URL}/json500raw`)
      .errorType("json")
      .get()
      .internalError(error => {
        expect(error.json).toEqual({ error: 500, message: "ok" })
        expect(error.text).toEqual(JSON.stringify({ error: 500, message: "ok" }))
      })
      .res(_ => fail("I should never be called because an error was thrown"))
      .then(_ => expect(_).toBe(undefined))
    // Default (text)
    await wretch(`${_URL}/json500raw`)
      .get()
      .internalError(error => {
        expect(error.text).toEqual(`{"error":500,"message":"ok"}`)
        expect(error.json).toBeUndefined()
      })
      .res(_ => fail("I should never be called because an error was thrown"))
      .then(_ => expect(_).toBe(undefined))
    // Based on content-type
    await wretch(`${_URL}/json500`)
      .get()
      .internalError(error => {
        expect(error.text).toEqual(`{"error":500,"message":"ok"}`)
        expect(error.json).toEqual({ error: 500, message: "ok" })
      })
      .res(_ => fail("I should never be called because an error was thrown"))
      .then(_ => expect(_).toBe(undefined))
    // Global
    wretch.errorType("json")
    await wretch(`${_URL}/json500raw`)
      .get()
      .internalError(error => {
        expect(error.json).toEqual({ error: 500, message: "ok" })
        expect(error.text).toEqual(JSON.stringify({ error: 500, message: "ok" }))
      })
      .res(_ => fail("I should never be called because an error was thrown"))
      .then(_ => expect(_).toBe(undefined))
  })

  it("should retrieve performance timings associated with a fetch request", function (done) {
    const w = wretch()
      .addon(PerfsAddon())
      .polyfills({
        fetch: fetchPolyfill(1)
      })
    // Test empty perfs()
    w.url(`${_URL}/text`).get().perfs().res(_ => expect(_.ok).toBeTruthy()).then(_ => {
      // Racing condition : observer triggered before response
      w.url(`${_URL}/bla`).get().perfs(timings => {
        expect(timings.name).toBe(`${_URL}/bla`)
        expect(typeof timings.startTime).toBe("number")

        // Racing condition : response triggered before observer
        w
          .polyfills({
            fetch: fetchPolyfill(1000)
          })
          .url(`${_URL}/fakeurl`)
          .get()
          .perfs(timings => {
            expect(timings.name).toBe(`${_URL}/fakeurl`)
            expect(typeof timings.startTime).toBe("number")
            done()
          })
          .res()
          .catch(() => "ignore")
      }).res().catch(_ => "ignore")
    })
    // Test multiple requests concurrency and proper timings dispatching
    for (let i = 0; i < 5; i++) {
      w.url(`${_URL}/fake/${i}`).get().perfs(timings => {
        expect(timings.name).toBe(`${_URL}/fake/${i}`)
      }).res().catch(() => "ignore")
    }
  })

  it("should abort a request", function (done) {
    let count = 0

    const handleError = error => {
      expect(error.name).toBe("AbortError")
      count++
    }

    const controller = new AbortController()
    wretch(`${_URL}/longResult`)
      .addon(AbortAddon())
      .signal(controller)
      .get()
      .res()
      .catch(handleError)
    controller.abort()

    const [c, w] = wretch(`${_URL}/longResult`).addon(AbortAddon()).get().controller()
    w.res().catch(handleError)
    c.abort()

    wretch(`${_URL}/longResult`)
      .addon(AbortAddon())
      .get()
      .setTimeout(100)
      .fetchError(() => { /* ignore - tests precendence */ })
      .onAbort(handleError)
      .res()

    const [c2, w2] = wretch(`${_URL}/longResult`).addon(AbortAddon()).get().controller()
    w2.setTimeout(100, c2).onAbort(handleError).res()

    setTimeout(() => {
      expect(count).toBe(4)
      done()
    }, 1000)
  })

  it("should program resolvers", async function () {
    let check = 0
    const w = wretch()
      .addon(PerfsAddon())
      .polyfills({
        fetch: fetchPolyfill(1)
      })
      .url(_URL)
      .resolve(resolver => resolver
        .unauthorized(_ => check--))
      .resolve(resolver => resolver
        .unauthorized(_ => check++), true)
      .resolve(resolver => resolver
        .perfs(_ => check++)
        .json(_ => { check++; return _ }))
    const result = await w.url("/json").get()
    await new Promise(res => setTimeout(res, 100))
    expect(result).toEqual({ a: "json", object: "which", is: "stringified" })
    expect(check).toBe(2)
    await w.url("/401").get()
    await new Promise(res => setTimeout(res, 100))
    expect(check).toBe(4)
  })

  it("should use middlewares", async function () {
    const shortCircuit = () => next => (url, opts) => Promise.resolve({
      ok: true,
      text: () => Promise.resolve(opts.method + "@" + url)
    } as any)
    const setGetMethod = () => next => (url, opts) => {
      return next(url, { ...opts, method: "GET" })
    }
    const setPostMethod = () => next => (url, opts) => {
      return next(url, { ...opts, method: "POST" })
    }
    const w = wretch().middlewares([
      shortCircuit()
    ])

    expect(await w.url(_URL).head().text()).toBe(`HEAD@${_URL}`)

    const w2 = w.middlewares([
      setGetMethod(),
      shortCircuit()
    ], true)

    expect(await w2.url(_URL).head().text()).toBe(`GET@${_URL}`)

    const w3 = w.middlewares([
      setGetMethod(),
      setPostMethod(),
      shortCircuit()
    ], true)

    expect(await w3.url(_URL).head().text()).toBe(`POST@${_URL}`)
  })

  it("should chain actions that will be performed just before the request is sent", async function () {
    const w = wretch(_URL + "/basicauth")
      .defer((w, url, opts) => {
        expect(opts.method).toBe("GET")
        expect(opts.q).toBe("a")
        expect(url).toBe(_URL + "/basicauth")
        return w.auth("toto")
      })
      .defer((w, url, { token }) => w.auth(token), true)

    const result = await w
      .options({ token: "Basic d3JldGNoOnLDtmNrcw==" })
      .options({ q: "a" })
      .get("")
      .text()
    expect(result).toBe("ok")
  })

  it("should replay a request with the same method", async function () {
    const result = await wretch(_URL + "/basicauth")
      .get()
      .unauthorized((_, request) => {
        return request
          .auth("Basic d3JldGNoOnLDtmNrcw==")
          .fetch()
          .text()
      })
      .text()

    expect(result).toBe("ok")
  })

  it("should handle falsey json", async function () {
    expect(await wretch(`${_URL}/json/null`).get().json()).toEqual(null)
    expect(await wretch(`${_URL}/json/null`).get().json(_ => true)).toEqual(true)
    expect(await wretch(`${_URL}/json/null`).get().json(_ => false)).toEqual(false)
  })

  it("should not append an extra character (&/?) when trying to append or replace empty query params", function () {
    const w = wretch(_URL).addon(QueryStringAddon)
    expect(w.query("")._url).toBe(_URL)
    expect(w.query("", true)._url).toBe(_URL)
    expect(w.query("a=1").query("", true)._url).toBe(_URL)
    expect(w.query({})._url).toBe(_URL)
    expect(w.query({}, true)._url).toBe(_URL)
    expect(w.query({ a: 1 }).query({}, true)._url).toBe(_URL)
  })

  it("should strip undefined values", function () {
    const w = wretch(_URL).addon(QueryStringAddon)
    expect(w.query({ a: undefined, b: 1 })._url).toBe(_URL + "?a=&b=1")
    expect(w.query({ array: ["a", "b", undefined, "c"] })._url).toBe(_URL + "?array=a&array=b&array=&array=c")
  })
})

describe("Mix", function () {
  it("should mix two objects", function () {
    const obj1 = { a: 1, b: 2, c: [3, 4] }
    const obj2proto = { z: 1 }
    const obj2 = Object.create(obj2proto)
    Object.assign(obj2, { a: 0, d: 5, e: [6], c: [5, 6] })
    expect(mix(obj1, obj2, false)).toEqual({ a: 0, b: 2, c: [5, 6], d: 5, e: [6] })
    expect(mix(obj1, obj2, true)).toEqual({ a: 0, b: 2, c: [3, 4, 5, 6], d: 5, e: [6] })
  })
})
