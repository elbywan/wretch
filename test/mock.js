/* global Buffer */

// @ts-check
import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { promisify } from "util"
import { stringify } from "node:querystring"
import Fastify from "fastify"
import multipartPlugin from "@fastify/multipart"
import formBodyPlugin from "@fastify/formbody"
import authPlugin from "@fastify/basic-auth"
import corsPlugin from "@fastify/cors"

const delay = promisify(setTimeout)

const __dirname = dirname(fileURLToPath(import.meta.url))
const preload = {
  duck: readFileSync(resolve(__dirname, "assets", "duck.jpg"))
}

async function validate(username, password, _req, _reply) {
  if (username !== "wretch" || password !== "röcks") {
    return new Error("Winter is coming")
  }
}

/** @type {import("fastify").FastifyInstance | null} */
let server = null

/**
 * @param {number} port
 */
export function launch(port) {
  server = Fastify()

  server.register(multipartPlugin, { attachFieldsToBody: true })
  server.register(formBodyPlugin)
  server.register(authPlugin, { validate })
  server.addContentTypeParser("*", async function () { })

  server.register(corsPlugin, {
    allowedHeaders: ["Authorization", "X-Custom-Header", "X-Custom-Header-2", "X-Custom-Header-3", "X-Custom-Header-4", "content-type"],
    exposedHeaders: ["Allow", "Timing-Allow-Origin"],
    credentials: true,
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    strictPreflight: false,
    preflightContinue: true
  })

  server.register(setupErrors)

  server.addHook("preHandler", async (request, reply) => {
    reply.header("Timing-Allow-Origin", "*")
  })

  // Must define HEAD /json before setupReplies. Otherwise fastify will be unhappy
  server.head("/json", async (request, reply) => {
    reply.type("application/json")
    reply.header("allow", "GET,POST,PUT,PATCH,DELETE")
    reply.send()
    return reply
  })

  setupReplies(server, "text", textReply)
  setupReplies(server, "json", jsonReply)
  setupReplies(server, "blob", imgReply)
  setupReplies(server, "arrayBuffer", binaryReply)

  server.get("/ping", async () => {
    return null
  })

  server.get("/json/null", async (request, reply) => {
    reply.type("application/json")
    return null
  })

  server.options("/options", async (request, reply) => {
    reply.header("Allow", "OPTIONS")
    reply.send()
    return reply
  })

  server.get("/customHeaders", async (request, reply) => {
    const headerKeys = ["x-custom-header", "x-custom-header-2", "x-custom-header-3", "x-custom-header-4"]
    const hasCustomHeaders = headerKeys.every(key => key in request.headers)
    reply.code(hasCustomHeaders ? 200 : 400)
    reply.send("")

    return reply
  })

  server.post("/text/roundTrip", async (request, reply) => {
    if (request.headers["content-type"] === "text/plain") {
      return request.body
    }

    reply.code(400)
    reply.send()
    await reply
  })

  server.post("/json/roundTrip", async (request, reply) => {
    if (request.headers["content-type"] === "application/json") {
      return request.body
    }

    reply.code(400)
    reply.send()
    return reply
  })

  server.post("/urlencoded/roundTrip", async (request, reply) => {
    if (request.headers["content-type"] === "application/x-www-form-urlencoded") {
      return stringify(request.body)
    }

    reply.code(400)
    reply.send()
    return reply
  })

  server.post("/blob/roundTrip", async (request, reply) => {
    if (request.headers["content-type"] === "application/xxx-octet-stream") {
      reply.type("application/octet-stream")
      reply.send(request.raw)

      return reply
    }

    reply.code(400)
    reply.send()
    return reply
  })

  server.post("/formData/decode", async (request, reply) => {
    if (!request.headers["content-type"].startsWith("multipart/form-data")) {
      reply.code(400)
      reply.send()
      return reply
    }

    const promises = Object.values(request.body).map(async item => {
      if (Array.isArray(item)) {
        return [
          item[0].fieldname,
          item.flatMap(inner => inner.value)
        ]
      }

      if (!item.file) {
        return [item.fieldname, item.value]
      }

      const buffer = await item.toBuffer()
      return [item.fieldname, {
        data: Array.from(buffer.values()),
        type: "Buffer"
      }]
    })

    const pairs = await Promise.all(promises)

    return Object.fromEntries(pairs)
  })

  server.get("/accept", async request => {
    const accept = request.headers["accept"]

    if (accept === "application/json") {
      return { json: "ok" }
    }

    return "text"
  })


  server.after(() => {
    server.route({
      method: "GET",
      url: "/basicauth",
      onRequest: server.basicAuth,
      handler: async () => {
        return "ok"
      }
    })
  })

  server.get("/json500", async (request, reply) => {
    reply.status(500)
    return { error: 500, message: "ok" }
  })

  server.get("/json500raw", async (request, reply) => {
    reply.status(500)
    return JSON.stringify({ error: 500, message: "ok" })
  })

  server.get("/longResult", async () => {
    await delay(1000)
    return "ok"
  })

  server.get("/*", async (request, reply) => {
    reply.status(404)

    return {}
  })

  server.listen({ port })
}

export function stop() {
  server?.close()
  server = null
}

/** @type {import('fastify').RouteHandler} */
const textReply = async () => {
  return "A text string"
}
/** @type {import('fastify').RouteHandler} */
const jsonReply = async () => {
  return { a: "json", "object": "which", "is": "stringified" }
}
/** @type {import('fastify').RouteHandler} */
const imgReply = async (request, reply) => {
  reply.type("image/jpeg")

  return preload.duck
}
/** @type {import('fastify').RouteHandler} */
const binaryReply = async (request, reply) => {
  reply.type("application/octet-stream")
  return Buffer.from([0x00, 0x01, 0x02, 0x03])
}

/**
* @param {import('fastify').FastifyInstance} server
* @param {string} type
* @param {import('fastify').RouteHandler} fun
*/
const setupReplies = (server, type, fun) => {
  server.get("/" + type, fun)
  server.post("/" + type, fun)
  server.put("/" + type, fun)
  server.patch("/" + type, fun)
  server.delete("/" + type, fun)
}

/**
* @param {import('fastify').FastifyInstance} server
*/
const setupErrors = async server => {
  const errorList = [444, 449, 450, 451, 456, 495, 496, 497, 498, 499]
  for (let i = 0; i < 512; i++) {
    if (!errorList.includes(i))
      errorList.push(i)
    if (i === 418) i += 2
    else if (i === 426 || i === 429) i++
  }

  for (const error of errorList) {
    server.get("/" + error, async (request, reply) => {
      reply.code(error)
      return "error code : " + error
    })
  }
}
