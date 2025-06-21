import wretch from "../../../src"
import { delay } from "../../../src/middlewares"

export default describe("Delay Middleware", () => {
  it("should delay requests", async () => {
    let before = 0
    let after = 0
    await wretch("").polyfills({ fetch: () => Promise.resolve({ ok: true }) }).middlewares([
      next => (url, options) => {
        before = new Date().getTime()
        return next(url, options).then(response => {
          after = new Date().getTime()
          return response
        })
      },
      delay(1000)
    ]).get().res()
    expect(after - before).toBeGreaterThanOrEqual(999)
  })
})
