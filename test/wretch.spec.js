const nodeFetch = require("node-fetch")
const FormData = require("form-data")
const { performance, PerformanceObserver } = require("perf_hooks")
performance.clearResourceTimings = () => {}
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const mockServer = require("./mock")

const wretch = require("../dist/bundle/wretch")

const _PORT = 9876
const _URL = `http://localhost:${_PORT}/`

const allRoutes = (obj, type, action) => Promise.all([
    obj.get()[type](_ => _).then(action),
    obj.put()[type](action),
    obj.patch()[type](action),
    obj.post()[type](action),
    obj.delete()[type](action)
])

const fetchPolyfill = (timeout = null) =>
    function(url, opts) {
        performance.mark(url + " - begin")
        return nodeFetch(url, opts).then(_ => {
            performance.mark(url + " - end")
            measure = () => performance.measure(_.url, url + " - begin", url + " - end")
            if(timeout)
                setTimeout(measure, timeout)
            else
                measure()
            return _
        })
    }

const duckImage = fs.readFileSync(path.resolve(__dirname, "assets", "duck.jpg"))

describe("Wretch", function() {

    before(async function() {
        mockServer.launch(_PORT)
    })

    after(async function(){
        mockServer.stop()
    })

    it("should set and use non global polyfills", async function() {
        expect(() => wretch("...").query({ a: 1, b: 2 })).to.throw("URLSearchParams is not defined")
        expect(() => wretch("...").formData({ a: 1, b: 2})).to.throw("FormData is not defined")
        expect(() => wretch("...").get("...")).to.throw("fetch is not defined")

        wretch().polyfills({
            fetch: fetchPolyfill(),
            FormData: FormData,
            URLSearchParams: require("url").URLSearchParams,
        })

       await wretch(`${_URL}/text`).get().perfs(_ => expect.fail("should never be called")).res()

        wretch().polyfills({
            fetch: fetchPolyfill(),
            FormData: FormData,
            URLSearchParams: require("url").URLSearchParams,
            performance: performance,
            PerformanceObserver: PerformanceObserver
        })
    })

    it("should perform crud requests and parse a text response", async function() {
        const init = wretch(`${_URL}/text`)
        const test = _ => expect(_).to.equal("A text string")
        await allRoutes(init, "text", test)
    })

    it("should perform crud requests and parse a json response", async function() {
        const test = _ => expect(_).to.deep.equal({ a: "json", "object": "which", "is": "stringified" })
        const init = wretch(`${_URL}/json`)
        await allRoutes(init, "json", test)
    })

    it("should perform crud requests and parse a blob response", async function() {
        const test = _ => expect(_).to.satisfy(blob => {
            return blob.size === duckImage.length
        })
        const init = wretch(`${_URL}/blob`)
        await allRoutes(init, "blob", test)
    })

    it("should perform crud requests and parse an arrayBuffer response", async function() {
        const test = _ => expect(_).to.satisfy(arrayBuffer => {
            var buffer = new Buffer(arrayBuffer.byteLength)
            var view = new Uint8Array(arrayBuffer)
            for (let i = 0; i < buffer.length; ++i) {
                buffer[i] = view[i]
            }
            return buffer.equals(new Buffer.from([ 0x00, 0x01, 0x02, 0x03 ]))
        })
        const init = wretch(`${_URL}/arrayBuffer`)
        await allRoutes(init, "arrayBuffer", test)
    })

    it("should perform a plain text round trip", async function() {
        const text = "hello, server !"
        const roundTrip = await wretch(`${_URL}/text/roundTrip`).content("text/plain").body(text).post().text()
        expect(roundTrip).to.be.equal(text)
    })

    it("should perform a json round trip", async function() {
        const jsonObject = { a: 1, b: 2, c: 3 }
        const roundTrip = await wretch(`${_URL}/json/roundTrip`).json(jsonObject).post().json()
        expect(roundTrip).to.deep.equal(jsonObject)
    })

    it("should send a FormData object", async function() {
        const form = {
            hello: "world",
            duck: "Muscovy"
        }
        const decoded = await wretch(`${_URL}/formData/decode`).formData(form).post().json()
        expect(decoded).to.deep.equal({
            hello: "world",
            "duck": "Muscovy"
        })
    })

    it("should catch common error codes", async function() {
        const w = wretch(_URL + "/")

        let check = 0
        await w.url("400").get().badRequest(_ => {
            expect(_.message).to.be.equal("error code : 400")
            check++
        }).text(_ => expect(_).to.be.null)
        await w.url("401").get().unauthorized(_ => {
            expect(_.message).to.be.equal("error code : 401")
            check++
        }).text(_ => expect(_).to.be.null)
        await w.url("403").get().forbidden(_ => {
            expect(_.message).to.be.equal("error code : 403")
            check++
        }).text(_ => expect(_).to.be.null)
        await w.url("404").get().notFound(_ => {
            expect(_.message).to.be.equal("error code : 404")
            check++
        }).text(_ => expect(_).to.be.null)
        await w.url("408").get().timeout(_ => {
            expect(_.message).to.be.equal("error code : 408")
            check++
        }).text(_ => expect(_).to.be.null)
        await w.url("500").get().internalError(_ => {
            expect(_.message).to.be.equal("error code : 500")
            check++
        }).text(_ => expect(_).to.be.null)
        expect(check).to.be.equal(6)
    })

    it("should catch other error codes", async function() {
        let check = 0
        await wretch(`${_URL}/444`)
            .get()
            .notFound(_ => check++)
            .error(444, _ => check++)
            .unauthorized(_ => check++)
            .res(_ => expect(_).to.be.undefined)
        expect(check).to.be.equal(1)
    })

    it("should set and catch errors with global catchers", async function() {
        let check = 0
        let w = wretch()
            .catcher(404, err => check++)
            .catcher(500, err => check++)
        w = w.url(_URL + "/")
            .catcher(400, err => check++)
            .catcher(401, err => check--)

        await w.url("text").get().res(_ => check++)
        await w.url("/400").get().res(_ => check--)
        await w.url("/401").get().unauthorized(_ => check++).res(_ => check--)
        await w.url("/404").get().res(_ => check--)
        await w.url("/408").get().timeout(_ => check++).res(_ => check--)
        await w.url("/418").get().res(_ => check--).catch(_ => "muted")
        await w.url("/500").get().res(_ => check--)

        expect(check).to.be.equal(6)
    })

    it("should set default fetch options", async function() {
        let rejected = await new Promise(res => wretch(`${_URL}/customHeaders`).get().badRequest(_ => {
            res(true)
        }).res(result => res(!result)))
        expect(rejected).to.be.true
        wretch().defaults({
            headers: { "X-Custom-Header": "Anything" }
        })
        rejected = await new Promise(res => wretch(`${_URL}/customHeaders`).get().badRequest(_ => {
            res(true)
        }).res(result => res(!result)))
        expect(rejected).to.be.true
        wretch().defaults({
            headers: { "X-Custom-Header-2": "Anything" }
        }, true)
        rejected = await new Promise(res => wretch(`${_URL}/customHeaders`).get().badRequest(_ => {
            res(true)
        }).res(result => res(!result)))
        wretch().defaults("not an object", true)
        expect(rejected).to.be.true
        let accepted = await new Promise(res => wretch(`${_URL}/customHeaders`)
            .options({ headers: { "X-Custom-Header-3" : "Anything" } })
            .options({ headers: { "X-Custom-Header-4" : "Anything" } }, true)
            .get()
            .badRequest(_ => { res(false) })
            .res(result => res(!!result)))
        expect(accepted).to.be.true
    })

    it("should allow url, query parameters & options modifications and return a fresh new Wretcher object containing the change", async function() {
        const obj1 = wretch("...")
        const obj2 = obj1.url(_URL, true)
        expect(obj1._url).to.be.equal("...")
        expect(obj2._url).to.be.equal(_URL)
        const obj3 = obj1.options({ headers: { "X-test": "test" }})
        expect(obj3._options).to.deep.equal({ headers: { "X-test": "test" }})
        expect(obj1._options).to.deep.equal({})
        const obj4 = obj2.query({a: "1!", b: "2"})
        expect(obj4._url).to.be.equal(`${_URL}?a=1%21&b=2`)
        expect(obj2._url).to.be.equal(_URL)
        const obj5 = obj4.query({c: 6, d: [7, 8]})
        expect(obj4._url).to.be.equal(`${_URL}?a=1%21&b=2`)
        expect(obj5._url).to.be.equal(`${_URL}?c=6&d=7&d=8`)
    })

    it("should modify the Accept header", async function() {
        expect(await wretch(`${_URL}/accept`).get().text()).to.be.equal("text")
        expect(await wretch(`${_URL}/accept`).accept("application/json").get().json()).to.deep.equal({ json: "ok" })
    })

    it("should change the parsing used in the default error handler", async function() {
        wretch().errorType("json")
        await wretch(`${_URL}/json500`)
            .get()
            .internalError(error => { expect(error.json).to.deep.equal({ error: 500, message: "ok" }) })
            .res(_ => expect.fail("", "", "I should never be called because an error was thrown"))
            .then(_ => expect(_).to.be.undefined)
    })

    it("should retrieve performance timings associated with a fetch request", function(done) {
        // Test empty perfs()
        wretch(`${_URL}/text`).get().perfs().res(_ => expect(_.ok).to.be.true).then(
            // Racing condition : observer triggered before response
            wretch(`${_URL}/bla`).get().perfs(_ => {
                expect(typeof _.startTime).to.be.equal("number")

                // Racing condition : response triggered before observer
                wretch().polyfills({
                    fetch: fetchPolyfill(1000)
                })

                wretch(`${_URL}/fakeurl`).get().perfs(_ => {
                    expect(typeof _.startTime).to.be.equal("number")
                    done()
                }).res().catch(() => "ignore")
            }).res().catch(_ => "ignore")
        )
    })
})