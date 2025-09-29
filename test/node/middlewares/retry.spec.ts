import wretch, { WretchOptions } from "../../../src"
import { retry } from "../../../src/middlewares"

export default describe("Retry Middleware", () => {
  let logs: any[] = []
  const mock = (max = 5) => {
    const ref = { counter: 1 }
    return (url: string, options: WretchOptions): Promise<any> => {
      logs.push([url, options.method])
      return Promise.resolve({
        ok: ref.counter++ >= max,
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
    // default - 10 times
    await expect(base().get("/retry").res()).rejects.toThrowError(
      "Number of attempts exceeded."
    )
    expect(logs.length).toEqual(11)

    logs = []

    // should retry 5 times
    const five = base().fetchPolyfill(mock(5))
    await expect(five.get("/retry").res()).resolves.toBeTruthy()
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
    await expect(w.get("/retry").res()).rejects.toThrowError(
      "Number of attempts exceeded."
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
              expect(error).toBeUndefined()
              counter++
            },
          }),
        ],
        true
      )
      .options({ a: 1 })
    await expect(w.get("/retry").res()).rejects.toThrow(
      "Number of attempts exceeded."
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
    await expect(w.options({ a: 0 }).get("/0").res()).rejects.toThrow(
      "Number of attempts exceeded."
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
              fail("Should never be called")
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

    await expect(wThrow.get("/retry").res()).rejects.toThrow(
      "Network Error"
    )
    await expect(wRetry.get("/retry").res()).rejects.toThrow(
      "Network Error"
    )
    expect(counter).toBe(10)
  })

  it("should pass the latest response instead of throwing an error if resolveWithLatestResponse is true", async () => {
    const w = base().middlewares(
      [retry({ delayTimer: 1, resolveWithLatestResponse: true })],
      true
    )
    // WretchError
    await expect(w.get("/retry").res()).rejects.toMatchObject({
      response: { ok: false, counter: 12 },
    })
  })

  it.only("should skip flagged requests", async () => {
    const withSkip = base().middlewares(
      [retry({
        delayTimer: 1,
        skip(_, options) {
          return options.skipRetry
        },
      })],
      true
    )

    // default - 10 times
    await expect(withSkip.get("/retry").res()).rejects.toThrowError(
      "Number of attempts exceeded."
    )
    expect(logs.length).toEqual(11)

    logs = []

    // should not retry this time
    await expect(
      withSkip.options({ skipRetry: true }).get("/retry").res()
    ).rejects.toThrow()
    expect(logs.length).toEqual(1)
  })
})
