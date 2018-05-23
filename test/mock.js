const fs = require("fs")
const path = require("path")
const restify = require("restify")

const preload = {
    duck: fs.readFileSync(path.resolve(__dirname, "assets", "duck.jpg"))
}

const mockServer = {
    launch: port => {
        const server = restify.createServer()
        mockServer["server"] = server

        server.use(restify.plugins.queryParser())
        server.use(restify.plugins.jsonBodyParser())
        server.use(restify.plugins.multipartBodyParser())
        server.use(restify.plugins.authorizationParser())

        setupReplies(server, "text", textReply)
        setupReplies(server, "json", jsonReply)
        setupReplies(server, "blob", imgReply)
        setupReplies(server, "arrayBuffer", binaryReply)

        server.head("/json", (req, res) => {
            res.setHeader("content-type", "application/json")
            res.end()
        })

        server.opts("/options", (req, res) => {
            res.header("Allow", "OPTIONS")
            res.end()
        })

        server.get("/customHeaders", (req, res) => {
            const hasCustomHeaders = req.header("X-Custom-Header", false)
                && req.header("X-Custom-Header-2", false)
                && req.header("X-Custom-Header-3", false)
                && req.header("X-Custom-Header-4", false)
            res.send(hasCustomHeaders ? 200 : 400)
        })

        setupErrors(server)

        server.post("/text/roundTrip", (req,res) => {
            if(req.header("content-type") === "text/plain")
                res.sendRaw(req.body)
            else
                res.send(400)
        })

        server.post("/json/roundTrip", (req, res) => {
            if(req.header("content-type") === "application/json")
                res.json(req.body)
            else
                res.send(400)
        })

        server.post("/urlencoded/roundTrip", (req, res) => {
            if(req.header("content-type") === "application/x-www-form-urlencoded")
                res.sendRaw(req.body)
            else
                res.send(400)
        })

        server.post("/formData/decode", (req, res) => {
            if(req.header("content-type").startsWith("multipart/form-data"))
                res.json(req.params)
            else
                res.send(400)
        })

        server.get("/accept", (req, res) => {
            const accept = req.header("Accept")
            if(~accept.indexOf("application/json"))
                res.json({ json: "ok" })
            else
                res.sendRaw("text")
        })

        server.get("/basicauth", (req, res) => {
            if(req.authorization &&
                req.authorization.scheme === "Basic" &&
                req.authorization.basic.username === "wretch" &&
                req.authorization.basic.password === "rocks")
                res.sendRaw("ok")
            else
                res.send(401)
        })

        server.get("/json500", (req, res) => {
            res.json(500, { error: 500, message: "ok" })
        })

        server.get("/longResult", (req, res) => {
            setTimeout(() => res.sendRaw("ok"), 1000)
        })

        server.listen(port)
    },
    stop: () => {
        mockServer["server"].close()
    }
}

const textReply = (req, res) => {
    res.sendRaw("A text string")
}
const jsonReply = (req, res) => {
    res.json({ a: "json", "object": "which", "is": "stringified" })
}
const imgReply = (req, res) => {
    res.setHeader("content-type", "image/jpeg")
    res.send(preload.duck)
}
const binaryReply = (req, res) => {
    res.setHeader("content-type", "application/octet-stream")
    const binaryData = Buffer.from([ 0x00, 0x01, 0x02, 0x03 ])
    res.send(binaryData)
}

const setupReplies = (server, type, fun) => {
    server.get(   "/" + type, fun)
    server.post(  "/" + type, fun)
    server.put(   "/" + type, fun)
    server.patch( "/" + type, fun)
    server.del(   "/" + type, fun)
}

const setupErrors = server => {
    const errorList = [ 444, 449, 450, 451, 456, 495, 496, 497, 498, 499 ]
    for(let i = 0; i < 512; i++){
        if(!errorList.includes(i))
            errorList.push(i)
        if(i === 418) i += 2
        else if(i === 426 || i === 429) i++
    }

    for(let error of errorList) {
        server.get("/" + error, (req, res) => {
            res.sendRaw(error, "error code : " + error)
        })
    }
}

module.exports = mockServer

// mockServer.launch(9876)