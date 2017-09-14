global.fetch = require("node-fetch")
global.FormData = require("form-data")
const fs = require("fs")
const path = require("path")
const expect = require("chai").expect
const mockServer = require("./mock")

const wretch = require("../dist/bundle/wretch")

const PORT = 9876
const URL = `http://localhost:${PORT}/`

const allRoutes = (obj, type, action) => Promise.all([
    obj.get()[type](action),
    obj.put()[type](action),
    obj.patch()[type](action),
    obj.post()[type](action),
    obj.delete()[type](action)
])

const duckImage = fs.readFileSync(path.resolve(__dirname, "assets", "duck.jpg"))

describe("Wretch", function() {

    before(async function() {
        mockServer.launch(PORT)
    })

    after(async function(){
        mockServer.stop()
    })

    it("should perform crud requests and parse a text response", async function() {
        const init = wretch(`${URL}/text`)
        const test = _ => expect(_).to.equal("A text string")
        await allRoutes(init, "text", test)
    })

    it("should perform crud requests and parse a json response", async function() {
        const test = _ => expect(_).to.deep.equal({ a: "json", "object": "which", "is": "stringified" })
        const init = wretch(`${URL}/json`)
        await allRoutes(init, "json", test)
    })

    it("should perform crud requests and parse a blob response", async function() {
        const test = _ => expect(_).to.satisfy(blob => {
            return blob.size === duckImage.length
        })
        const init = wretch(`${URL}/blob`)
        await allRoutes(init, "blob", test)
    })

    it("should perform crud requests and parse an arrayBuffer response", async function() {
        const test = _ => expect(_).to.satisfy(arrayBuffer => {
            var buffer = new Buffer(arrayBuffer.byteLength)
            var view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < buffer.length; ++i) {
                buffer[i] = view[i]
            }
            return buffer.equals(new Buffer.from([ 0x00, 0x01, 0x02, 0x03 ]))
        })
        const init = wretch(`${URL}/arrayBuffer`)
        await allRoutes(init, "arrayBuffer", test)
    })

    it("should perform a json round trip", async function() {
        const jsonObject = { a: 1, b: 2, c: 3 }
        const roundTrip = await wretch(`${URL}/json/roundTrip`).json(jsonObject).post().json()
        expect(roundTrip).to.deep.equal(jsonObject)
    })

    it("should send a FormData object", async function() {
        const form = {
            hello: "world",
            duck: "Muscovy"
        }
        const decoded = await wretch(`${URL}/formData/decode`).formData(form).post().json()
        expect(decoded).to.deep.equal({
            hello: "world",
            "duck": "Muscovy"
        })
    })

    it("should catch common error codes", async function() {
        let check = 0
        await wretch(`${URL}/400`).get().badRequest(_ => {
            expect(_.message).to.be.equal("error code : 400")
            check++
        }).text(_ => expect(_).to.be.null)
        await wretch(`${URL}/401`).get().unauthorized(_ => {
            expect(_.message).to.be.equal("error code : 401")
            check++
        }).text(_ => expect(_).to.be.null)
        await wretch(`${URL}/403`).get().forbidden(_ => {
            expect(_.message).to.be.equal("error code : 403")
            check++
        }).text(_ => expect(_).to.be.null)
        await wretch(`${URL}/404`).get().notFound(_ => {
            expect(_.message).to.be.equal("error code : 404")
            check++
        }).text(_ => expect(_).to.be.null)
        await wretch(`${URL}/408`).get().timeout(_ => {
            expect(_.message).to.be.equal("error code : 408")
            check++
        }).text(_ => expect(_).to.be.null)
        await wretch(`${URL}/500`).get().internalError(_ => {
            expect(_.message).to.be.equal("error code : 500")
            check++
        }).text(_ => expect(_).to.be.null)
        expect(check).to.be.equal(6)
    })

    it("should catch other error codes", async function() {
        let check = 0
        await wretch(`${URL}/444`)
            .get()
            .notFound(_ => check++)
            .error(444, _ => check++)
            .unauthorized(_ => check++)
            .res(_ => expect(_).to.be.undefined)
        expect(check).to.be.equal(1)
    })

    it("should set default fetch options", async function() {
        let rejected = await new Promise(res => wretch(`${URL}/customHeaders`).get().badRequest(_ => {
            res(true)
        }).res(result => res(!result)))
        expect(rejected).to.be.true
        wretch().defaults({
            headers: { "X-Custom-Header": "Anything" }
        })
        rejected = await new Promise(res => wretch(`${URL}/customHeaders`).get().badRequest(_ => {
            res(true)
        }).res(result => res(!result)))
        expect(rejected).to.be.true
        wretch().mixdefaults({
            headers: { "X-Custom-Header-2": "Anything" }
        })
        rejected = await new Promise(res => wretch(`${URL}/customHeaders`).get().badRequest(_ => {
            res(true)
        }).res(result => res(!result)))
        wretch().mixdefaults("not an object")
        expect(rejected).to.be.true
        let accepted = await new Promise(res => wretch(`${URL}/customHeaders`)
            .options({ headers: { "X-Custom-Header-3" : "Anything" } })
            .get()
            .badRequest(_ => { res(false) })
            .res(result => res(!!result)))
        expect(accepted).to.be.true
    })

    it("should allow url, query parameters & options modifications and return a fresh new Wretch object containing the change", async function() {
        const obj1 = wretch()
        const obj2 = obj1.url(URL)
        expect(obj1._url).to.be.equal("")
        expect(obj2._url).to.be.equal(URL)
        const obj3 = obj1.options({ headers: { "X-test": "test" }})
        expect(obj3._options).to.deep.equal({ headers: { "X-test": "test" }})
        expect(obj1._options).to.deep.equal({})
        const obj4 = obj2.query({a: "1!", b: "2"})
        expect(obj4._url).to.be.equal(`${URL}?a=1%21&b=2`)
        expect(obj2._url).to.be.equal(URL)
        const obj5 = obj4.query({c: 6, d: [7, 8]})
        expect(obj4._url).to.be.equal(`${URL}?a=1%21&b=2`)
        expect(obj5._url).to.be.equal(`${URL}?c=6&d=7&d=8`)
    })

    it("should modify the Accept header", async function() {
        expect(await wretch(`${URL}/accept`).get().text()).to.be.equal("text")
        expect(await wretch(`${URL}/accept`).accept("application/json").get().json()).to.deep.equal({ json: "ok" })
    })

    it("should change the parsing used in the default error handler", async function() {
        wretch().errorType("json")
        await wretch(`${URL}/json500`)
            .get()
            .internalError(error => { expect(error.json).to.deep.equal({ error: 500, message: "ok" }) })
            .res(_ => expect.fail("", "", "I should never be called because an error was thrown"))
            .then(_ => expect(_).to.be.undefined)
    })
})