import {
  assertEquals,
  fail
} from "jsr:@std/assert"
import {
  beforeAll,
  describe,
  it,
} from "jsr:@std/testing/bdd"

import wretchFn from "../../dist/bundle/wretch.min.mjs"
import BasicAuthAddon from "../../dist/bundle/addons/basicAuth.min.mjs"
import FormUrlAddon from "../../dist/bundle/addons/formUrl.min.mjs"
import FormDataAddon from "../../dist/bundle/addons/formData.min.mjs"
import QueryAddon from "../../dist/bundle/addons/queryString.min.mjs"
import AbortAddon from "../../dist/bundle/addons/abort.min.mjs"
// import PerfsAddon from "../../dist/bundle/addons/perfs.min.mjs"
import type { Wretch, WretchResponseChain, WretchResponse, Middleware } from "../../dist/types.d.ts"

declare type factory = {
  (_url?: string, _options?: object): Wretch;
  options: (options: object, replace?: boolean | undefined) => void;
  errorType: (errorType: string) => void;
  polyfills: (polyfills: object, replace?: boolean | undefined) => void;
}

const wretch = wretchFn as unknown as factory

// Deno.test("url test", () => {
//   const url = new URL("./foo.js", "https://deno.land/")
//   assertEquals(url.href, "https://deno.land/foo.js")
// })

const _PORT = 9876
const _URL = "http://localhost:" + _PORT

const allRoutes = (obj: Wretch, type: keyof WretchResponseChain<undefined>, action: any, body: any = undefined) => Promise.all([
  (obj.get("")[type] as any)().then(action),
  (obj.put(body, "")[type] as any)(action),
  (obj.patch(body, "")[type] as any)(action),
  (obj.post(body, "")[type] as any)(action),
  (obj.delete("")[type] as any)(action),
])

describe("Wretch", function () {

  beforeAll(async function () {
    await new Promise(resolve => setTimeout(resolve, 2000))
  })

  it("should perform crud requests and parse a text response", async function () {
    const init = wretch(`${_URL}/text`)
    const test = (_: any) => assertEquals(_, "A text string")
    await allRoutes(init, "text", test)
    await allRoutes(init, "text", test, {})
  })

  it("should perform crud requests and parse a json response", async function () {
    const test = (_: any) => assertEquals(_, { a: "json", object: "which", is: "stringified" })
    const init = wretch(`${_URL}/json`)
    await allRoutes(init, "json", test)
    await allRoutes(init, "json", test, {})
  })

  it("should perform crud requests and parse a blob response", async function () {
    const test = (_: any) => assertEquals(_.size, 58921)
    const init = wretch(`${_URL}/blob`)
    await allRoutes(init, "blob", test)
    await allRoutes(init, "blob", test, {})
  })

  it("should perform crud requests and parse an arrayBuffer response", async function () {
    const compareBuffers = function (buf1: Uint8Array, buf2: Uint8Array) {
      if (buf1.byteLength !== buf2.byteLength)
        return false
      for (let i = 0; i < buf1.byteLength; i++) {
        if (buf1[i] != buf2[i])
          return false
      }
      return true
    }
    const test = (arrayBuffer: ArrayBuffer) => {
      const view = new Uint8Array(arrayBuffer)
      const test = new Uint8Array([0x00, 0x01, 0x02, 0x03])
      assertEquals(compareBuffers(view, test), true)
    }
    const init = wretch(`${_URL}/arrayBuffer`)
    await allRoutes(init, "arrayBuffer", test)
    await allRoutes(init, "arrayBuffer", test, {})
  })

  it("should perform a plain text round trip", async function () {
    const text = "hello, server !"
    const roundTrip = await wretch(`${_URL}/text/roundTrip`).content("text/plain").body(text).post().text()
    assertEquals(roundTrip, text)
    // Using shorthand
    const roundTrip2 = await wretch(`${_URL}/text/roundTrip`).content("text/plain").post(text).text()
    assertEquals(roundTrip2, text)
  })

  it("should perform a json round trip", async function () {
    const jsonObject = { a: 1, b: 2, c: 3 }
    const roundTrip = await wretch(`${_URL}/json/roundTrip`).json(jsonObject).post().json()
    assertEquals(roundTrip, jsonObject)
    // Using shorthand
    const roundTrip2 = await wretch(`${_URL}/json/roundTrip`).post(jsonObject).json()
    assertEquals(roundTrip2, jsonObject)
    // Ensure that calling .json with the shorthand works
    const roundTrip3 = await wretch(`${_URL}/json/roundTrip`).json({}).post(jsonObject).json()
    assertEquals(roundTrip3, jsonObject)
    // Ensure that it preserves any content type set previously
    try {
      await wretch(`${_URL}/json/roundTrip`).content("bad/content").post(jsonObject).json()
      fail("should have thrown")
    } catch {
      // ignore
    }
    // Ensure that the charset is preserved.
    const headerWithCharset = "application/json; charset=utf-16"
    assertEquals((wretch()).content(headerWithCharset).json({})._options.headers?.["Content-Type" as keyof HeadersInit], headerWithCharset)
  })

  it("should perform an url encoded form data round trip", async function () {
    const reference = "a=1&b=2&%20c=%203&d=%7B%22a%22%3A1%7D"
    const jsonObject = { "a": 1, "b": 2, " c": " 3", "d": { a: 1 } }
    let roundTrip = await wretch(`${_URL}/urlencoded/roundTrip`).addon(FormUrlAddon).formUrl(reference).post().text()
    assertEquals(roundTrip, reference)
    roundTrip = await wretch(`${_URL}/urlencoded/roundTrip`).addon(FormUrlAddon).formUrl(jsonObject).post().text()
    assertEquals(roundTrip, reference)
    // Ensure that calling .json with the shorthand works
    const roundTrip3 = await wretch(`${_URL}/json/roundTrip`).json({}).post(jsonObject).json()
    assertEquals(roundTrip3, jsonObject)
    // Ensure that it preserves any content type set previously
    try {
      await wretch(`${_URL}/json/roundTrip`).content("bad/content").post(jsonObject).json()
      fail("should have thrown")
    } catch {
      // ignore
    }
  })

  it("should send a FormData object", async function () {
    const form = {
      hello: "world",
      duck: "Muscovy",
      duckProperties: {
        beak: {
          color: "yellow"
        },
        nbOfLegs: 2
      }
    }
    const decoded = await wretch(`${_URL}/formData/decode`)
      .addon(FormDataAddon)
      .formData(form, ["duckImage"] as any)
      .post()
      .json()
    assertEquals(decoded, {
      hello: "world",
      duck: "Muscovy",
      "duckProperties[beak][color]": "yellow",
      "duckProperties[nbOfLegs]": "2"
    })
    const f = { arr: [1, 2, 3] }
    const d = await wretch(`${_URL}/formData/decode`).addon(FormDataAddon).formData(f).post().json()
    assertEquals(d, {
      "arr": ["1", "2", "3"]
    })
  })

  it("should not Jasonify a FormData instance", async function () {
    const FormData = wretch()._config.polyfill(
      "FormData",
      false
    )

    const formData = new FormData()
    formData.append("hello", "world")
    formData.append("duck", "Muscovy")

    const decoded = await wretch(`${_URL}/formData/decode`)
      .post(formData)
      .json()
    assertEquals(decoded, {
      hello: "world",
      duck: "Muscovy",
    })
  })

  it("should perform OPTIONS and HEAD requests", async function () {
    const optsRes = await wretch(_URL + "/options").opts().res()
    const optsRes2 = await wretch(_URL + "/options").opts("").res()
    assertEquals(optsRes.headers.get("Allow"), "OPTIONS")
    assertEquals(optsRes2.headers.get("Allow"), "OPTIONS")
    const headRes = await wretch(_URL + "/json").head().res()
    const headRes2 = await wretch(_URL + "/json").head("").res()
    assertEquals(headRes.headers.get("content-type"), "application/json")
    assertEquals(headRes2.headers.get("content-type"), "application/json")
    await optsRes.text()
    await optsRes2.text()
  })

  it("should preserve existing headers when undefined or null is passed to .headers()", async function () {
    const headers = { "X-HELLO": "WORLD", "X-Y": "Z" }
    let req = wretch().headers({ "X-HELLO": "WORLD" })
    req = req.headers({ "X-Y": "Z" })
    assertEquals(req._options.headers, headers)
    req = req.headers(null as any)
    assertEquals(req._options.headers, headers)
    req = req.headers(undefined as any)
    assertEquals(req._options.headers, headers)
  })

  it("should catch common error codes", async function () {
    const w = wretch(_URL + "/")

    let check = 0
    await w.url("400").get().badRequest(_ => {
      assertEquals(_.message, "error code : 400")
      check++
    }).text(_ => assertEquals(_, null))
    await w.url("401").get().unauthorized(_ => {
      assertEquals(_.message, "error code : 401")
      check++
    }).text(_ => assertEquals(_, null))
    await w.url("403").get().forbidden(_ => {
      assertEquals(_.message, "error code : 403")
      check++
    }).text(_ => assertEquals(_, null))
    await w.url("404").get().notFound(_ => {
      assertEquals(_.message, "error code : 404")
      check++
    }).text(_ => assertEquals(_, null))
    await w.url("408").get().timeout(_ => {
      assertEquals(_.message, "error code : 408")
      check++
    }).text(_ => assertEquals(_, null))
    await w.url("500").get().internalError(_ => {
      assertEquals(_.message, "error code : 500")
      check++
    }).text(_ => assertEquals(_, null))
    assertEquals(check, 6)
  })

  it("should catch other error codes", async function () {
    let check = 0
    await wretch(`${_URL}/444`)
      .get()
      .notFound(_ => check++)
      .error(444, _ => check++)
      .unauthorized(_ => check++)
      .res(_ => assertEquals(_, undefined))
    assertEquals(check, 1)
  })

  it("should set and catch errors with global catchers", async function () {
    let check = 0
    const w = wretch(_URL)
      .catcher(404, _err => check++)
      .catcher(500, _err => check++)
      .catcher(400, _err => check++)
      .catcher(401, _err => check--)
      .catcher("SyntaxError", _err => check++)

    // +1 : 1
    await w.url("/text").get().res(_ => {
      _.body?.cancel()
      check++
    })
    // +0 : 1
    await w.url("/text").get().json<any>(_ => {
      _.body?.cancel()
      check--
    })
    // +1 : 2
    await w.url("/400").get().res(_ => {
      _.body?.cancel()
      check--
    })
    // +1 : 3
    await w.url("/401").get().unauthorized(_ => check++).res(_ => {
      _.body?.cancel()
      check--
    })
    // +1 : 4
    await w.url("/404").get().res(_ => {
      _.body?.cancel()
      check--
    })
    // +1 : 5
    await w.url("/408").get().timeout(_ => check++).res(_ => {
      _.body?.cancel()
      check--
    })
    // +1 : 6
    await w.url("/418").get().res(_ => {
      _.body?.cancel()
      check--
    }).catch(_ => "muted")
    // +1: 7
    await w.url("/500").get().res(_ => {
      _.body?.cancel()
      check--
    })

    assertEquals(check, 7)
  })

  it("should capture the original request with resolvers/catchers", async function () {
    let check = 0
    const redirectedNotFound = await wretch(`${_URL}/404`)
      .get()
      .notFound((error, req) => {
        check++
        return req.url(`${_URL}/text`, true).get().text()
      }).text()
    assertEquals(redirectedNotFound, "A text string")

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

    assertEquals(await withNotFoundCatcher.get().text(), "A text string")
    assertEquals(await withNotFoundRedirect.get().text(), "A text string")
    assertEquals(check, 3)
  })

  it("should set default fetch options", async function () {
    let rejected = await new Promise(res => wretch(`${_URL}/customHeaders`).get().badRequest(_ => {
      res(true)
    }).res(result => { result.body?.cancel(); return res(!result) }))
    assertEquals(rejected, true)
    wretch.options({
      headers: { "X-Custom-Header": "Anything" }
    }, true)
    rejected = await new Promise(res => wretch(`${_URL}/customHeaders`).get().badRequest(_ => {
      res(true)
    }).res(result => { result.body?.cancel(); return res(!result) }))
    assertEquals(rejected, true)
    wretch.options({
      headers: { "X-Custom-Header-2": "Anything" }
    })
    rejected = await new Promise(res => wretch(`${_URL}/customHeaders`).get().badRequest(_ => {
      res(true)
    }).res(result => { result.body?.cancel(); return res(!result) }))
    // wretch.options("not an object" as any, true)
    assertEquals(rejected, true)
    const accepted = await new Promise(res => wretch(`${_URL}/customHeaders`)
      .options({ headers: { "X-Custom-Header-3": "Anything" } }, false)
      .options({ headers: { "X-Custom-Header-4": "Anything" } })
      .get()
      .badRequest(_ => { res(false) })
      .res(result => { result.body?.cancel(); return res(!!result) }))
    assertEquals(accepted, true)
  })

  it("should allow url, query parameters & options modifications and return a fresh new Wretch object containing the change", async function () {
    const obj1 = wretch("...")
    const obj2 = obj1.url(_URL, true)
    assertEquals(obj1["_url"], "...")
    assertEquals(obj2["_url"], _URL)
    const obj3 = obj1.options({ headers: { "X-test": "test" } })
    assertEquals(obj3["_options"], { headers: { "X-test": "test" } })
    assertEquals(obj1["_options"], {})
    const obj4 = obj2.addon(QueryAddon).query({ a: "1!", b: "2" })
    assertEquals(obj4["_url"], `${_URL}?a=1%21&b=2`)
    assertEquals(obj2["_url"], _URL)
    const obj5 = obj4.query({ c: 6, d: [7, 8] })
    assertEquals(obj4["_url"], `${_URL}?a=1%21&b=2`)
    assertEquals(obj5["_url"], `${_URL}?a=1%21&b=2&c=6&d=7&d=8`)
    const obj6 = obj5.query("Literal[]=Query&String", true)
    assertEquals(obj5["_url"], `${_URL}?a=1%21&b=2&c=6&d=7&d=8`)
    assertEquals(obj6["_url"], `${_URL}?Literal[]=Query&String`)
    const obj7 = obj5.query("Literal[]=Query&String").url("/test")
    assertEquals(obj5["_url"], `${_URL}?a=1%21&b=2&c=6&d=7&d=8`)
    assertEquals(obj7["_url"], `${_URL}/test?a=1%21&b=2&c=6&d=7&d=8&Literal[]=Query&String`)
  })

  it("should set the Accept header", async function () {
    assertEquals(await wretch(`${_URL}/accept`).get().text(), "text")
    assertEquals(await wretch(`${_URL}/accept`).accept("application/json").get().json(), { json: "ok" })
  })

  describe("handling of the Authorization header", function () {
    it("should fail without an Authorization header", async function () {
      try {
        await wretch(_URL + "/basicauth")
          .get()
          .res(_ => fail("Authenticated route should not respond without credentials."))
      } catch (e: any) {
        assertEquals(e.status, 401)
      }
    })

    it("should set the Authorization header using the .auth() method", async function () {
      const res = await wretch(_URL + "/basicauth")
        .auth("Basic d3JldGNoOnLDtmNrcw==")
        .get()
        .text()

      assertEquals(res, "ok")
    })

    it("should set the Authorization header using the BasicAuth addon's .basicAuth() method", async function () {
      const res = await wretch(_URL + "/basicauth")
        .addon(BasicAuthAddon)
        .basicAuth("wretch", "röcks")
        .get()
        .text()

      assertEquals(res, "ok")
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

      assertEquals(res, "ok")
    })
  })

  it("should change the parsing used in the default error handler", async function () {
    await wretch(`${_URL}/json500`)
      .get()
      .internalError(error => { assertEquals(error.text, "{\"error\":500,\"message\":\"ok\"}") })
      .res(_ => fail("I should never be called because an error was thrown"))
      .then(_ => assertEquals(_, undefined))
    wretch.errorType("json")
    await wretch(`${_URL}/json500`)
      .get()
      .internalError(error => { assertEquals(error.json, { error: 500, message: "ok" }) })
      .res(_ => fail("I should never be called because an error was thrown"))
      .then(_ => assertEquals(_, undefined))
    // Change back
    wretch.errorType("text")
  })

  it("should abort a request", async function () {
    let count = 0

    const handleError = (error: Error) => {
      assertEquals(error.name, "AbortError")
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
      .onAbort(handleError)
      .res()

    const [c2, w2] = wretch(`${_URL}/longResult`).addon(AbortAddon()).get().controller()
    w2.setTimeout(100, c2).onAbort(handleError).res()

    await new Promise(done => setTimeout(() => {
      assertEquals(count, 4)
      done(null)
    }, 1000))
  })

  it("should program resolvers", async function () {
    let check = 0
    const w = wretch()
      .url(_URL)
      .resolve(resolver => resolver
        .unauthorized(_ => check--))
      .resolve(resolver => resolver
        .unauthorized(_ => check++), true)
      .resolve(resolver => resolver
        // .perfs(_ => check++)
        .json(_ => { check++; return _ }))
    const result = await w.url("/json").get()
    await new Promise(res => setTimeout(res, 100))
    assertEquals(result as any, { a: "json", object: "which", is: "stringified" })
    assertEquals(check, 1)
    await w.url("/401").get()
    await new Promise(res => setTimeout(res, 100))
    assertEquals(check, 2)
  })

  // it("should retrieve performance timings associated with a fetch request", async function () {
  //   const fetchPolyfill = (timeout: number | null = null) => (
  //     function (url: string, opts: object) {
  //       performance.mark(url + " - begin")
  //       return fetch(url, opts).then(res => {
  //         performance.mark(url + " - end")
  //         const measure = () => performance.measure(res.url, url + " - begin", url + " - end")
  //         if (timeout)
  //           setTimeout(measure, timeout)
  //         else
  //           measure()
  //         return res
  //       })
  //     }
  //   )
  //   let result = false

  //   const w = wretch(_URL).polyfills({ fetch: fetchPolyfill() }).addon(PerfsAddon())

  //   // Test empty perfs()
  //   await w.get("/text").perfs().res((_: any) => _.body.cancel() && assertEquals(_.ok, true)).then(() => {
  //     // Racing condition : observer triggered before response
  //     return w.get("/bla").perfs((_: PerformanceEntry) => {
  //       assertEquals(typeof _.startTime, "number")

  //       // Racing condition : response triggered before observer
  //       w.get("/fakeurl").perfs((_: PerformanceEntry) => {
  //         assertEquals(typeof _.startTime, "number")
  //         result = true
  //       }).text().catch(() => "ignore")
  //     }).text().catch((_: Error) => "ignore")
  //   })

  //   await new Promise(resolve => setTimeout(resolve, 1000))

  //   assertEquals(result, true)
  // })

  it("should use middlewares", async function () {
    const shortCircuit: Middleware = () => _next => (url, opts) => Promise.resolve({
      ok: true,
      text: () => Promise.resolve(opts.method + "@" + url)
    } as WretchResponse)
    const setGetMethod: Middleware = () => next => (url, opts) => {
      return next(url, Object.assign(opts, { method: "GET" }))
    }
    const setPostMethod: Middleware = () => next => (url, opts) => {
      return next(url, Object.assign(opts, { method: "POST" }))
    }
    const w = wretch().middlewares([
      shortCircuit()
    ])

    assertEquals(await w.url(_URL).head().text(), `HEAD@${_URL}`)

    const w2 = w.middlewares([
      setGetMethod(),
      shortCircuit()
    ], true)

    assertEquals(await w2.url(_URL).head().text(), `GET@${_URL}`)

    const w3 = w.middlewares([
      setGetMethod(),
      setPostMethod(),
      shortCircuit()
    ], true)

    assertEquals(await w3.url(_URL).head().text(), `POST@${_URL}`)
  })

  it("should chain actions that will be performed just before the request is sent", async function () {
    const w = wretch(_URL + "/basicauth")
      .defer((w, url, opts) => {
        assertEquals(opts.method, "GET")
        assertEquals(opts.q, "a")
        assertEquals(url, _URL + "/basicauth")
        return w.auth("toto")
      })
      .defer((w, url, { token }) => w.auth(token), true)

    const result = await w
      .options({ token: "Basic d3JldGNoOnLDtmNrcw==" })
      .options({ q: "a" })
      .get("")
      .text()
    assertEquals(result, "ok")
  })

  it("should handle falsey json", async function () {
    assertEquals(await wretch(`${_URL}/json/null`).get().json(), null)
    assertEquals(await wretch(`${_URL}/json/null`).get().json(_ => true), true)
    assertEquals(await wretch(`${_URL}/json/null`).get().json(_ => false), false)
  })
})
