import { describe, it, beforeEach } from "node:test"
import * as assert from "node:assert"
import wretch, { WretchOptions } from "../../../src"
import { retry } from "../../../src/middlewares"
import { expect } from "../helpers"

export default describe("Retry Middleware", () => {
  let logs: any[] = []
  const mock = (max = 5) => {
    const ref = { counter: 1 }
    return (url: string, options: WretchOptions): Promise<any> => {
      logs.push([url, options.method])
      return Promise.resolve({
        ok: ref.counter++ >= max,
        headers: new Headers(),
        text() {
          return Promise.resolve("")
        },
        counter: ref.counter,
      })
    }
  }
  const base = () =>
    wretch()
      .fetchPolyfill(mock(Infinity))
      .middlewares([
        retry({
          delayTimer: 1,
        }),
      ])

  beforeEach(() => {
    logs = []
  })

  it("should retry requests", async () => {
    await assert.rejects(
      () => base().get("/retry").res(),
      /Number of attempts exceeded\./
    )
    expect(logs.length).toEqual(11)

    logs = []

    const five = base().fetchPolyfill(mock(5))
    await five.get("/retry").res()
    expect(logs.length).toEqual(5)
  })

  it("should retry up to 'maxAttempts'", async () => {
    const w = base().middlewares(
      [
        retry({
          delayTimer: 1,
          maxAttempts: 3,
        }),
      ],
      true
    )
    await assert.rejects(
      () => w.get("/retry").res(),
      /Number of attempts exceeded\./
    )
    expect(logs.length).toEqual(4)
  })

  it("should be possible to specify a retry condition using 'until'", async () => {
    const w = base().middlewares(
      [
        retry({
          delayTimer: 1,
          until(response: any) {
            if (response && response["counter"] === 4) {
              response["ok"] = true
              return response
            }
            return false
          },
        }),
      ],
      true
    )

    await w.get("/retry").res()
    expect(logs.length).toEqual(3)
  })

  it("should execute 'onRetry'", async () => {
    let counter = 0
    const w = base()
      .middlewares(
        [
          retry({
            delayTimer: 1,
            onRetry({ url, options, error }) {
              expect(url).toBe("/retry")
              expect(options).toMatchObject({ a: 1 })
              assert.strictEqual(error, undefined)
              counter++
            },
          }),
        ],
        true
      )
      .options({ a: 1 })
    await assert.rejects(
      () => w.get("/retry").res(),
      /Number of attempts exceeded\./
    )
    expect(counter).toEqual(10)
    expect(logs.length).toEqual(11)
  })

  it("should allow 'onRetry' to modify url and options", async () => {
    let counter = 0
    const w = base().middlewares(
      [
        retry({
          delayTimer: 1,
          onRetry() {
            counter++
            return { url: `/${counter}`, options: { method: `${counter}` } }
          },
        }),
      ],
      true
    )
    await assert.rejects(
      () => w.options({ a: 0 }).get("/0").res(),
      /Number of attempts exceeded\./
    )
    logs.forEach((log, index) => {
      expect(log).toMatchObject([`/${index}`, index === 0 ? "GET" : `${index}`])
    })
  })

  it("should retry on network error", async () => {
    const throwPolyfill = () => Promise.reject(new Error("Network Error"))
    const wThrow = wretch()
      .fetchPolyfill(throwPolyfill)
      .middlewares(
        [
          retry({
            delayTimer: 1,
            retryOnNetworkError: false,
            onRetry() {
              throw new Error("Should never be called")
            },
          }),
        ],
        true
      )
    let counter = 0
    const wRetry = wretch()
      .fetchPolyfill(throwPolyfill)
      .middlewares(
        [
          retry({
            delayTimer: 1,
            retryOnNetworkError: true,
            onRetry({ error }) {
              expect(error).toMatchObject({ message: "Network Error" })
              counter++
            },
          }),
        ],
        true
      )

    await assert.rejects(
      () => wThrow.get("/retry").res(),
      /Network Error/
    )
    await assert.rejects(
      () => wRetry.get("/retry").res(),
      /Network Error/
    )
    expect(counter).toBe(10)
  })

  it("should pass the latest response instead of throwing an error if resolveWithLatestResponse is true", async () => {
    const w = base().middlewares(
      [retry({ delayTimer: 1, resolveWithLatestResponse: true })],
      true
    )
    try {
      await w.get("/retry").res()
      assert.fail("Expected to reject")
    } catch (err: any) {
      expect(err.response).toMatchObject({ ok: false, counter: 12 })
    }
  })

  it("should skip flagged requests", async () => {
    const withSkip = base().middlewares(
      [retry({
        delayTimer: 1,
        skip(_, options) {
          return options.skipRetry
        },
      })],
      true
    )

    await assert.rejects(
      () => withSkip.get("/retry").res(),
      /Number of attempts exceeded\./
    )
    expect(logs.length).toEqual(11)

    logs = []

    await assert.rejects(
      () => withSkip.options({ skipRetry: true }).get("/retry").res()
    )
    expect(logs.length).toEqual(1)
  })
})
