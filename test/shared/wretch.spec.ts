import wretch from "../../src"
import { mix } from "../../src/utils"

import AbortAddon from "../../src/addons/abort"
import BasicAuthAddon from "../../src/addons/basicAuth"
import FormDataAddon from "../../src/addons/formData"
import FormUrlAddon from "../../src/addons/formUrl"
import PerfsAddon from "../../src/addons/perfs"
import ProgressAddon from "../../src/addons/progress"
import QueryStringAddon from "../../src/addons/queryString"

import { WretchError } from "../../src/resolver"
import type { Wretch, FetchLike, WretchOptions, WretchResponse } from "../../src"

const _PORT = 9876
const _URL = `http://localhost:${_PORT}`

const isSafari =
  globalThis.navigator &&
  navigator.userAgent.indexOf("Safari") >= 0 &&
  navigator.userAgent.indexOf("Chrome") < 0
const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined"
const isDeno = typeof globalThis.Deno !== "undefined"
const isBun = typeof globalThis.Bun !== "undefined"

const allRoutes = <T>(
  obj: Wretch,
  type: string,
  action: (result: T) => void | Promise<void>,
  body?: unknown
): Promise<unknown[]> => Promise.all([
    obj.get("")[type]((_: T) => _).then(action),
    obj.put(body, "")[type](action),
    obj.patch(body, "")[type](action),
    obj.post(body, "")[type](action),
    obj.delete("")[type](action),
  ])

export type DescribeFn = (name: string, fn: () => void) => void
export type ItFn = (name: string, fn: () => void | Promise<void>) => void
export type BeforeEachFn = (fn: () => void | Promise<void>) => void
export type BeforeFn = (fn: (this: { timeout: (ms: number) => void }) => void | Promise<void>) => void

export interface AssertModule {
  rejects?: (
    fn: () => Promise<unknown>,
    validator?: (error: unknown) => boolean
  ) => Promise<void>
}

interface ExpectFn {
  (actual: unknown): {
    toBe: (expected: unknown) => void
    toEqual: (expected: unknown) => void
    toBeNull: () => void
    toBeUndefined: () => void
    toBeTruthy: () => void
    toMatchObject?: (expected: unknown) => void
  }
}

interface FsModule {
  openAsBlob?: (path: string) => Promise<Blob>
}

interface TestContext {
  describe: DescribeFn
  it: ItFn
  beforeEach?: BeforeEachFn
  before?: BeforeFn
  assert: AssertModule
  expect: ExpectFn
  fs: FsModule
  duckImage: Buffer | Uint8Array
  duckImagePath: string
}

export function createWretchTests(ctx: TestContext): void {
  const { describe, it, before, assert, expect, fs, duckImage, duckImagePath } = ctx

  describe("Wretch", function () {

    if (before) {
      before(async function () {
        this.timeout(5000)
      })
    }

    it("should allow setting a custom fetch implementation", async function () {
      let fetchCalled = false
      const customFetch = (url: string, opts: RequestInit) => {
        fetchCalled = true
        return fetch(url, opts)
      }

      const result = await wretch(`${_URL}/text`)
        .fetchPolyfill(customFetch)
        .get()
        .text()

      expect(result).toBe("A text string")
      expect(fetchCalled).toBe(true)
    })



    it("should perform crud requests and parse a text response", async function () {
      const init = wretch(`${_URL}/text`)
      const test = (result: string) => expect(result).toBe("A text string")
      await allRoutes(init, "text", test)
      await allRoutes(init, "text", test, {})
    })

    it("should perform crud requests and parse a json response", async function () {
      const test = (result: unknown) => expect(result).toEqual({ a: "json", object: "which", is: "stringified" })
      const init = wretch(`${_URL}/json`)
      await allRoutes(init, "json", test)
      await allRoutes(init, "json", test, {})
    })

    it("should perform crud requests and parse a blob response", async function () {
      const test = (result: Blob) => expect(result.size).toBe(duckImage.length || 58921)
      const init = wretch(`${_URL}/blob`)
      await allRoutes(init, "blob", test)
      await allRoutes(init, "blob", test, {})
    })

    it("should not stringify a blob when the content-type is not json", async function () {
      const hasBuffer = typeof Buffer !== "undefined" && Buffer.from
      const compareBuffers = (buf1: Buffer | Uint8Array, buf2: Buffer | Uint8Array): boolean => {
        if (buf1.length !== buf2.length) return false
        if (hasBuffer && "compare" in buf1 && typeof buf1.compare === "function") {
          return buf1.compare(buf2) === 0
        }
        return buf1.every((v, i) => v === buf2[i])
      }

      const result1 = await wretch(`${_URL}/blob/roundTrip`, {
        headers: { "content-type": "application/xxx-octet-stream" }
      })
        .post(duckImage)
        .arrayBuffer(buf => hasBuffer ? Buffer.from(buf) : new Uint8Array(buf))
      expect(compareBuffers(result1, duckImage)).toBe(true)

      const result2 = await wretch(`${_URL}/blob/roundTrip`)
        .headers({ "content-type": "application/xxx-octet-stream" })
        .post(duckImage)
        .arrayBuffer(buf => hasBuffer ? Buffer.from(buf) : new Uint8Array(buf))
      expect(compareBuffers(result2, duckImage)).toBe(true)
    })

    it("should perform crud requests and parse an arrayBuffer response", async function () {
      const test = (arrayBuffer: ArrayBuffer) => {
        const hasBuffer = typeof Buffer !== "undefined" && Buffer.alloc
        const buffer = hasBuffer ? Buffer.alloc(arrayBuffer.byteLength) : new Uint8Array(arrayBuffer)
        const view = new Uint8Array(arrayBuffer)
        for (let i = 0; i < buffer.length; ++i) {
          buffer[i] = view[i]
        }
        const expected = hasBuffer ? Buffer.from([0x00, 0x01, 0x02, 0x03]) : new Uint8Array([0x00, 0x01, 0x02, 0x03])
        const isEqual = (hasBuffer && "equals" in buffer && typeof buffer.equals === "function")
          ? buffer.equals(expected)
          : buffer.every((v, i) => v === expected[i])
        expect(isEqual).toBe(true)
      }
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
      const roundTrip3 = await wretch(`${_URL}/json/roundTrip`).json({}).post(jsonObject).json()
      expect(roundTrip3).toEqual(jsonObject)
      await assert.rejects(
        () => wretch(`${_URL}/json/roundTrip`).content("bad/content").post(jsonObject).json()
      )
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
      let form: object = {
        hello: "world",
        duck: "Muscovy",
        duckImage: await fs.openAsBlob(duckImagePath),
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
        .formData(form, { recursive: ["duckImage"] })
        .post()
        .json()

      if (expect(decoded).toMatchObject) {
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
      }

      form = {
        hello: "world",
        nested: {
          property: 1
        }
      }
      decoded = await wretch(`${_URL}/formData/decode`)
        .addon(FormDataAddon)
        .formData(form, { recursive: true })
        .post()
        .json()
      if (expect(decoded).toMatchObject) {
        expect(decoded).toMatchObject({
          hello: "world",
          "nested[property]": "1",
        })
      }

      form = {
        hello: "world",
      }
      decoded = await wretch(`${_URL}/formData/decode`)
        .addon(FormDataAddon)
        .formData(form)
        .post()
        .json()
      if (expect(decoded).toMatchObject) {
        expect(decoded).toMatchObject({
          hello: "world"
        })
      }

      const f = { arr: [1, 2, 3] }
      const d = await wretch(`${_URL}/formData/decode`).addon(FormDataAddon).formData(f).post().json()
      expect(d).toEqual({
        "arr": ["1", "2", "3"]
      })
    })

    it("should not Jasonify a FormData instance", async function () {
      const formData = new FormData()
      formData.append("hello", "world")
      formData.append("duck", "Muscovy")
      const fileBlob = new Blob([duckImage.buffer as ArrayBuffer], { type: "image/jpeg" })
      formData.append("duckImage", fileBlob, "duck.jpg")

      const decoded = await wretch(`${_URL}/formData/decode`)
        .post(formData)
        .json()
      if (expect(decoded).toMatchObject) {
        expect(decoded).toMatchObject({
          hello: "world",
          duck: "Muscovy",
          duckImage: { data: duckImage, type: "Buffer" }
        })
      }
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
      req = req.headers(null)
      expect(req._options.headers).toEqual(headers)
      req = req.headers(undefined)
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
        .res(_ => expect(_).toBeUndefined())
      expect(check).toBe(1)

      check = 0
      await wretch(`${_URL}/444`)
        .options({ signal: AbortSignal.abort() })
        .get()
        .notFound(_ => check++)
        .error(444, _ => check++)
        .unauthorized(_ => check++)
        .fetchError(_ => check--)
        .res(_ => expect(_).toBeUndefined())
      expect(check).toBe(-1)
    })

    it("should set and catch errors with global catchers", async function () {
      let check = 0
      const w = wretch(_URL)
        .catcher(404, _ => check++)
        .catcher(500, _ => check++)
        .catcher(400, _ => check++)
        .catcher(401, _ => check--)
        .catcherFallback(_ => check++)

      await w.url("/text").get().res(_ => check++)
      await w.url("/text").catcherFallback(_ => {}).get().json(_ => check--)
      await w.url("/400").get().res(_ => check--)
      await w.url("/401").get().unauthorized(_ => check++).res(_ => check--)
      await w.url("/404").get().res(_ => check--)
      await w.url("/408").get().timeout(_ => check++).res(_ => check--)
      await w.url("/418").get().res(_ => check--).catch(_ => "muted")
      await w.url("/500").get().res(_ => check--)

      expect(check).toBe(7)
    })

    it("should use the fallback catcher", async function () {
      let _404 = 0
      let fetchError = 0
      let fallback = 0

      const w = wretch(_URL)
        .catcher(404, _ => _404++)
        .catcherFallback(_ => fallback++)

      await w.url("/404").get().res(_ => fallback--)
      await w
        .options({ signal: AbortSignal.abort() })
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
      const obj6 = obj5.query("Literal[]=Query&String", { replace: true })
      expect(obj5["_url"]).toBe(`${_URL}?a=1%21&b=2&c=6&d=7&d=8`)
      expect(obj6["_url"]).toBe(`${_URL}?Literal[]=Query&String`)
      const obj7 = obj5.query("Literal[]=Query&String").url("/test")
      expect(obj5["_url"]).toBe(`${_URL}?a=1%21&b=2&c=6&d=7&d=8`)
      expect(obj7["_url"]).toBe(`${_URL}/test?a=1%21&b=2&c=6&d=7&d=8&Literal[]=Query&String`)
    })

    it("should accept multiple addons at once", async function () {
      const w = wretch(`${_URL}/basicauth`)
        .addon([BasicAuthAddon, QueryStringAddon])
        .basicAuth("wretch", "röcks")
        .query({ test: "value" })

      expect(w["_url"]).toBe(`${_URL}/basicauth?test=value`)
      expect(w._options.headers["Authorization"]).toBe("Basic d3JldGNoOnLDtmNrcw==")
      const res = await w.get().text()
      expect(res).toBe("ok")
    })

    it("should set the Accept header", async function () {
      expect(await wretch(`${_URL}/accept`).get().text()).toBe("text")
      expect(await wretch(`${_URL}/accept`).accept("application/json").get().json()).toEqual({ json: "ok" })
    })

    describe("handling of the Authorization header", function () {
      it("should fail without using an Authorization header", async function () {
        await assert.rejects(
          async () => {
            await wretch(_URL + "/basicauth")
              .get()
              .res()
          },
          (e: WretchError) => {
            expect(e.status).toBe(401)
            expect(e.url).toBe(_URL + "/basicauth")
            return true
          }
        )
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

    it("should allow transforming errors with fully typed error bodies", async function () {
      await wretch(`${_URL}/json500raw`)
        .customError(async (error, response) => {
          return { ...error, message: response.statusText, json: await response.json() }
        })
        .get()
        .internalError(error => {
          expect(error.json).toEqual({ error: 500, message: "ok" })
          expect(error.message).toEqual("Internal Server Error")
        })
        .res()
        .then(_ => expect(_).toBeUndefined())

      await wretch(`${_URL}/json500raw`)
        .get()
        .internalError(error => {
          expect(error.message).toEqual("{\"error\":500,\"message\":\"ok\"}")
        })
        .res()
        .then(_ => expect(_).toBeUndefined())

      await wretch(`${_URL}/json500raw`)
        .customError(async (error, response) => {
          const json = await response.json()
          return { ...error, json, message: json.message }
        })
        .get()
        .internalError(error => {
          expect(error.json).toEqual({ "error":500, "message": "ok" })
          expect(error.message).toEqual("ok")
        })
        .res()
        .then(_ => expect(_).toBeUndefined())
    })

    it("should retrieve performance timings associated with a fetch request", async function () {
      if (isSafari || isDeno || isBun)
        return

      const w = wretch()
        .addon(PerfsAddon())
      await w.url(`${_URL}/text`).get().perfs().res(_ => expect(_.ok).toBeTruthy())

      await new Promise<void>(resolve => {
        w.url(`${_URL}/bla`).get().perfs(timings => {
          expect(timings.name).toBe(`${_URL}/bla`)
          expect(typeof timings.startTime).toBe("number")
          resolve()
        }).res().catch(_ => "ignore")
      })

      await Promise.all(new Array(5).fill(0).map((_, i) =>
        new Promise<void>(resolve => {
          w.url(`${_URL}/fake/${i}`).get().perfs(timings => {
            expect(timings.name).toBe(`${_URL}/fake/${i}`)
            resolve()
          }).res().catch(() => "ignore")
        })
      ))
    })

    it("should monitor download progress", async function () {
      const w = wretch()
        .addon(ProgressAddon())

      await new Promise<void>(resolve => {
        let progressCalled = false
        w.url(`${_URL}/blob`).get().progress((loaded, total) => {
          progressCalled = true
          expect(typeof loaded).toBe("number")
          expect(typeof total).toBe("number")
          expect(loaded).toBe(total)
          expect(loaded).toBe(duckImage.length || 58921)
        }).blob(() => {
          expect(progressCalled).toBe(true)
          resolve()
        })
      })
    })

    it("should monitor upload progress with string body", async function () {
      if(isBrowser)
        return

      const testString = "hello world"
      const expectedSize = new Blob([testString]).size

      await new Promise<void>((resolve, reject) => {
        let progressCalled = false
        wretch(`${_URL}/text/roundTrip`)
          .addon(ProgressAddon())
          .content("text/plain")
          .onUpload((loaded, total) => {
            progressCalled = true
            expect(typeof loaded).toBe("number")
            expect(typeof total).toBe("number")
            expect(loaded).toBe(total)
            expect(total).toBe(expectedSize)
          })
          .post(testString)
          .text(() => {
            expect(progressCalled).toBe(true)
            resolve()
          })
          .catch(reject)
      })
    })

    it("should monitor upload progress with Blob body", async function () {
      if(isBrowser)
        return

      const blob = new Blob([duckImage.buffer as ArrayBuffer], { type: "image/jpeg" })

      await new Promise<void>(resolve => {
        let progressCalled = false
        wretch(`${_URL}/blob/roundTrip`)
          .addon(ProgressAddon())
          .content("application/xxx-octet-stream")
          .onUpload((loaded, total) => {
            progressCalled = true
            expect(typeof loaded).toBe("number")
            expect(typeof total).toBe("number")
            expect(loaded).toBe(total)
            expect(total).toBe(blob.size)
          })
          .post(blob)
          .res(() => {
            expect(progressCalled).toBe(true)
            resolve()
          })
      })
    })

    it("should monitor upload progress with ArrayBuffer body", async function () {
      if(isBrowser)
        return

      const buffer = duckImage.buffer as ArrayBuffer

      await new Promise<void>(resolve => {
        let progressCalled = false
        wretch(`${_URL}/blob/roundTrip`)
          .addon(ProgressAddon())
          .content("application/xxx-octet-stream")
          .onUpload((loaded, total) => {
            progressCalled = true
            expect(typeof loaded).toBe("number")
            expect(typeof total).toBe("number")
            expect(loaded).toBe(total)
            expect(total).toBe(buffer.byteLength)
          })
          .post(buffer)
          .res(() => {
            expect(progressCalled).toBe(true)
            resolve()
          })
      })
    })

    it("should monitor upload progress with FormData body", async function () {
      if(isBrowser)
        return

      const formData = new FormData()
      formData.append("hello", "world")
      formData.append("duck", "Muscovy")

      await new Promise<void>(resolve => {
        let progressCalled = false
        wretch(`${_URL}/formData/decode`)
          .addon(ProgressAddon())
          .onUpload((loaded, total) => {
            progressCalled = true
            expect(typeof loaded).toBe("number")
            expect(typeof total).toBe("number")
            expect(loaded).toBe(total)
            expect(total > 0).toBe(true)
          })
          .post(formData)
          .json(() => {
            expect(progressCalled).toBe(true)
            resolve()
          })
      })
    })

    it("should not call upload progress callback when no body is sent", async function () {
      if(isBrowser)
        return

      let progressCalled = false
      await wretch(`${_URL}/text`)
        .addon(ProgressAddon())
        .onUpload(() => {
          progressCalled = true
        })
        .get()
        .text()

      expect(progressCalled).toBe(false)
    })

    it("should monitor both upload and download progress", async function () {
      if(isBrowser)
        return

      const blob = new Blob([duckImage.buffer as ArrayBuffer], { type: "image/jpeg" })

      await new Promise<void>(resolve => {
        let uploadCalled = false
        let downloadCalled = false
        wretch(`${_URL}/blob/roundTrip`)
          .addon(ProgressAddon())
          .onUpload((loaded, total) => {
            uploadCalled = true
            expect(typeof loaded).toBe("number")
            expect(typeof total).toBe("number")
            expect(loaded).toBe(total)
            expect(total).toBe(blob.size)
          })
          .onDownload((loaded, total) => {
            downloadCalled = true
            expect(typeof loaded).toBe("number")
            expect(typeof total).toBe("number")
          })
          .content("application/xxx-octet-stream")
          .post(blob)
          .blob(() => {
            expect(uploadCalled).toBe(true)
            expect(downloadCalled).toBe(true)
            resolve()
          })
      })
    })

    it("should abort a request", async function () {
      let count = 0

      const handleError = (error: Error) => {
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
        .fetchError(() => { })
        .onAbort(handleError)
        .res()

      const [c2, w2] = wretch(`${_URL}/longResult`).addon(AbortAddon()).get().controller()
      w2.setTimeout(100, { controller: c2 }).onAbort(handleError).res()

      await new Promise(resolve => setTimeout(resolve, 1000))
      expect(count).toBe(4)
    })

    it("should program resolvers", async function () {
      if(isSafari || isDeno || isBun)
        return

      let check = 0
      const w = wretch()
        .addon(PerfsAddon())
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
      const shortCircuit = () => (_next: FetchLike) => (url: string, opts: WretchOptions): Promise<WretchResponse> => Promise.resolve({
        ok: true,
        text: () => Promise.resolve(opts.method + "@" + url)
      } as WretchResponse)
      const setGetMethod = () => (next: FetchLike) => (url: string, opts: WretchOptions) => {
        return next(url, { ...opts, method: "GET" })
      }
      const setPostMethod = () => (next: FetchLike) => (url: string, opts: WretchOptions) => {
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
      expect(w.query("", { replace: true })._url).toBe(_URL)
      expect(w.query("a=1").query("", { replace: true })._url).toBe(_URL)
      expect(w.query({})._url).toBe(_URL)
      expect(w.query({}, { replace: true })._url).toBe(_URL)
      expect(w.query({ a: 1 }).query({}, { replace: true })._url).toBe(_URL)
    })

    it("should strip or omit undefined/null values", function () {
      const w = wretch(_URL).addon(QueryStringAddon)
      expect(w.query({ a: undefined, b: 1 })._url).toBe(_URL + "?a=&b=1")
      expect(w.query({ a: undefined, b: 1, c: null }, { omitUndefinedOrNullValues: true })._url).toBe(_URL + "?b=1")
      expect(w.query({ array: ["a", "b", undefined, "c"] })._url).toBe(_URL + "?array=a&array=b&array=&array=c")
    })
  })
}

export function createMixTests(ctx: TestContext): void {
  const { describe, it, expect } = ctx

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
}
