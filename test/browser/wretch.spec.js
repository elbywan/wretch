import { expect } from "./helpers.js"
import wretch from "../../dist/index.all.js"

const _PORT = 9876
const _URL = "http://localhost:" + _PORT

const allRoutes = (obj, type, action, body) => Promise.all([
  obj.get("")[type](_ => _).then(action),
  obj.put(body, "")[type](action),
  obj.patch(body, "")[type](action),
  obj.post(body, "")[type](action),
  obj.delete("")[type](action),
])

const isSafari =
  navigator.userAgent.indexOf("Safari") >= 0 &&
  navigator.userAgent.indexOf("Chrome") < 0

describe("Wretch", function () {

  before(async function () {
    this.timeout(5000)
    await new Promise(resolve => setTimeout(resolve, 2000))
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
    const test = _ => expect(_.size).toBe(58921)
    const init = wretch(`${_URL}/blob`)
    await allRoutes(init, "blob", test)
    await allRoutes(init, "blob", test, {})
  })

  it("should perform crud requests and parse an arrayBuffer response", async function () {
    const compareBuffers = function (buf1, buf2) {
      if (buf1.byteLength !== buf2.byteLength)
        return false
      for (let i = 0; i < buf1.byteLength; i++) {
        const dv1 = new DataView(buf1)
        const dv2 = new DataView(buf2)
        if (dv1.getUint8(i) !== dv2.getUint8(i))
          return false
      }
      return true
    }
    const reference = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer
    const test = arrayBuffer => expect(compareBuffers(arrayBuffer, reference)).toBeTruthy()
    const init = wretch(`${_URL}/arrayBuffer`)
    await allRoutes(init, "arrayBuffer", test)
    await allRoutes(init, "arrayBuffer", test, {})
  })

  it("should perform a plain text round trip", async function () {
    const text = "hello, server !"
    const roundTrip = await wretch(`${_URL}/text/roundTrip`).content("text/plain").body(text).post().text()
    expect(roundTrip).toBe(text)
    const roundTrip2 = await wretch(`${_URL}/text/roundTrip`).content("text/plain").post(text).text()
    expect(roundTrip2).toBe(text)
  })

  it("should perform a json round trip", async function () {
    const jsonObject = { a: 1, b: 2, c: 3 }
    const roundTrip = await wretch(`${_URL}/json/roundTrip`).json(jsonObject).post().json()
    expect(roundTrip).toEqual(jsonObject)
    const roundTrip2 = await wretch(`${_URL}/json/roundTrip`).post(jsonObject).json()
    expect(roundTrip2).toEqual(jsonObject)
  })

  it("should perform an url encoded form data round trip", async function () {
    const reference = "a=1&b=2&%20c=%203&d=%7B%22a%22%3A1%7D"
    const jsonObject = { "a": 1, "b": 2, " c": " 3", "d": { a: 1 } }
    let roundTrip = await wretch(`${_URL}/urlencoded/roundTrip`).formUrl(reference).post().text()
    expect(roundTrip).toBe(reference)
    roundTrip = await wretch(`${_URL}/urlencoded/roundTrip`).formUrl(jsonObject).post().text()
    expect(roundTrip).toBe(reference)
  })

  it("should send a FormData object", async function () {
    const form = new FormData()
    form.append("a", "1")
    form.append("b", "2")
    form.append("c", "3")
    const decoded = await wretch(`${_URL}/formData/decode`).body(form).post().json()
    expect(decoded).toEqual({
      a: "1",
      b: "2",
      c: "3",
    })
    const form2 = {
      a: 1,
      b: 2,
      c: 3,
    }
    const decoded2 = await wretch(`${_URL}/formData/decode`).formData(form2).post().json()
    expect(decoded2).toEqual({
      a: "1",
      b: "2",
      c: "3",
    })
    const form3 = {
      hello: "world",
      duck: "Muscovy",
      duckProperties: {
        beak: {
          color: "yellow"
        },
        nbOfLegs: 2
      }
    }
    const form3Decoded = await wretch(`${_URL}/formData/decode`)
      .formData(form3, ["duckImage"])
      .post()
      .json()
    expect(form3Decoded).toEqual({
      hello: "world",
      duck: "Muscovy",
      "duckProperties[beak][color]": "yellow",
      "duckProperties[nbOfLegs]": "2"
    })
    const f = { arr: [1, 2, 3] }
    const d = await wretch(`${_URL}/formData/decode`).formData(f).post().json()
    expect(d).toEqual({
      "arr": ["1", "2", "3"]
    })
  })

  it("should not Jasonify a FormData instance", async function () {
    const formData = new FormData()
    formData.append("hello", "world")
    formData.append("duck", "Muscovy")

    const decoded = await wretch(`${_URL}/formData/decode`)
      .post(formData)
      .json()
    expect(decoded).toEqual({
      hello: "world",
      duck: "Muscovy",
    })
  })

  it("should perform OPTIONS and HEAD requests", async function () {
    const optsRes = await wretch(_URL + "/options").opts().res()
    const optsRes2 = await wretch(_URL + "/options").opts("").res()
    expect(optsRes.headers.get("Allow")).toBe("OPTIONS")
    expect(optsRes2.headers.get("Allow")).toBe("OPTIONS")
    const headRes = await wretch(_URL + "/json").head().res()
    expect(headRes.headers.get("content-type")).toBe("application/json")
  })

  it("should preserve existing headers when undefined or null is passed to .headers()", function () {
    const req = wretch().headers({ "X-HEADER": "VALUE" })
    expect(req._options.headers["X-HEADER"]).toBe("VALUE")
    expect(req.headers(null)._options.headers["X-HEADER"]).toBe("VALUE")
    expect(req.headers(undefined)._options.headers["X-HEADER"]).toBe("VALUE")
  })

  it("should catch common error codes", async function () {
    const w = wretch(_URL + "/")

    let check = 0
    await w.url("400").get().badRequest(_ => check++)
      .res().then(_ => { throw new Error("Should not be called") })
      .catch(_ => { })
    expect(check).toBe(1)
    await w.url("401").get().unauthorized(_ => check++)
      .res().then(_ => { throw new Error("Should not be called") })
      .catch(_ => { })
    expect(check).toBe(2)
    await w.url("403").get().forbidden(_ => check++)
      .res().then(_ => { throw new Error("Should not be called") })
      .catch(_ => { })
    expect(check).toBe(3)
    await w.url("404").get().notFound(_ => check++)
      .res().then(_ => { throw new Error("Should not be called") })
      .catch(_ => { })
    expect(check).toBe(4)
    await w.url("408").get().timeout(_ => check++)
      .res().then(_ => { throw new Error("Should not be called") })
      .catch(_ => { })
    expect(check).toBe(5)
    await w.url("500").get().internalError(_ => check++)
      .res().then(_ => { throw new Error("Should not be called") })
      .catch(_ => { })
    expect(check).toBe(6)
  })

  it("should catch other error codes", async function () {
    const w = wretch(_URL + "/444")
    let check = 0
    await w.get().error(444, _ => check++).res(_ => { throw new Error("Should not be called") }).catch(_ => { })
    expect(check).toBe(1)
  })

  it("should set and catch errors with global catchers", async function () {
    let check = 0
    const w = wretch(_URL)
      .catcher(404, err => check++)
      .catcher(500, err => check++)
      .catcher(400, err => check--)
    await w.url("/404").get().res(_ => { throw new Error("Should not be called") })
    expect(check).toBe(1)
    await w.url("/500").get().res(_ => { throw new Error("Should not be called") })
    expect(check).toBe(2)
    await w.url("/400").get().res(_ => { throw new Error("Should not be called") })
    expect(check).toBe(1)
    await w.url("/404").get().notFound(_ => check++).res(_ => { throw new Error("Should not be called") }).catch(_ => { })
    expect(check).toBe(2)
    await w.url("/401").get().unauthorized(_ => check++).res(_ => { throw new Error("Should not be called") }).catch(_ => { })
    expect(check).toBe(3)
    await w.url("/403").get().forbidden(_ => check++).res(_ => { throw new Error("Should not be called") }).catch(_ => { })
    expect(check).toBe(4)
    await w.url("/408").get().timeout(_ => check++).res(_ => { throw new Error("Should not be called") }).catch(_ => { })
    expect(check).toBe(5)
    await w.url("/418").get().error(418, _ => check++).res(_ => { throw new Error("Should not be called") }).catch(_ => { })
    expect(check).toBe(6)
  })

  it("should capture the original request with resolvers/catchers", async function () {
    try {
      await wretch(`${_URL}/401`).get().res()
    } catch (error) {
      expect(error.status).toBe(401)
      expect(error.url).toBe(`${_URL}/401`)
    }

    let check = 0
    await wretch(`${_URL}/500`)
      .get()
      .notFound(_ => { throw new Error("Should not be called") })
      .unauthorized(_ => { throw new Error("Should not be called") })
      .internalError(error => {
        expect(error.status).toBe(500)
        expect(error.url).toBe(`${_URL}/500`)
        check++
      })
      .res(_ => { throw new Error("Should not be called") }).catch(_ => { })
    expect(check).toBe(1)
  })

  describe("handling of the Authorization header", function () {

    it("should fail without using an Authorization header", async function () {
      try {
        await wretch(_URL + "/basicauth")
          .get()
          .res(_ => { throw new Error("Authenticated route should not respond without credentials.") })
      } catch (e) {
        expect(e.status).toBe(401)
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
        .get()
        .text()

      expect(res).toBe("ok")
    })

  })

  it("should change the parsing used in the default error handler", async function () {
    wretch.errorType("json")
    let w = wretch(_URL + "/json400")
    await w.get().res().catch(error => {
      expect(error.json).toEqual({ "error": 400, "message": "bad request" })
    })
    wretch.errorType("text")
  })

  it("should abort a request", function (done) {
    if (!window.AbortController || isSafari)
      return done()

    let count = 0

    const handleError = error => {
      expect(error.name).toBe("AbortError")
      count++
    }

    const controller = new AbortController()
    wretch(`${_URL}/longResult`)
      .signal(controller)
      .get()
      .res()
      .catch(handleError)
    controller.abort()

    const [c, w] = wretch(`${_URL}/longResult`).get().controller()
    w.res().catch(handleError)
    c.abort()

    wretch(`${_URL}/longResult`)
      .get()
      .setTimeout(100)
      .onAbort(handleError)
      .res()

    const [c2, w2] = wretch(`${_URL}/longResult`).get().controller()
    w2.setTimeout(100, c2).onAbort(handleError).res()

    setTimeout(() => {
      expect(count).toBe(4)
      done()
    }, 1000)
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
        .json(_ => { check++; return _ }))
    const result = await w.url("/json").get()
    await new Promise(res => setTimeout(res, 100))
    expect(result).toEqual({ a: "json", object: "which", is: "stringified" })
    expect(check).toBe(1)
    await w.url("/401").get()
    await new Promise(res => setTimeout(res, 100))
    expect(check).toBe(2)
  })

  it("should retrieve performance timings associated with a fetch request", async function () {
    if (isSafari)
      return
    let check = 0
    await new Promise((resolve) => {
      wretch(_URL + "/text").get().perfs(timings => {
        check++
        resolve()
      }).res()
    })
    expect(check).toBe(1)
  })

  it("should use middlewares", async function () {
    let check = 0
    const w = wretch(_URL + "/middlewares").middlewares([
      next => (url, opts) => {
        check++
        return next(url, opts)
      },
      next => (url, opts) => {
        check++
        return next(url, opts)
      },
    ])

    await w.get().res()
    expect(check).toBe(2)
  })

  it("should chain actions that will be performed just before the request is sent", async function () {
    let check = ""
    const w = wretch()
      .defer((w, url, options) => {
        check += url
        return w
      })
      .defer((w, url) => {
        check += url
        return w
      }, true)

    await w.url(_URL + "/text").get().res()
    expect(check).toBe(_URL + "/text")
  })

  it("should handle falsey json", async function () {
    expect(await wretch(_URL + "/json/null").get().json()).toBeNull()
  })

})
