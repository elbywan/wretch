import { describe, it, beforeEach } from "node:test"
import * as assert from "node:assert"
import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"
import { expect } from "./helpers"
import { createWretchTests, createMixTests } from "../shared/wretch.spec"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const duckImagePath = path.resolve(__dirname, "..", "assets", "duck.jpg")
const duckImage = fs.readFileSync(duckImagePath)

createWretchTests({
  describe,
  it: (name, fn) => it(name,{ timeout: 5000 }, fn),
  beforeEach,
  assert,
  expect,
  fs,
  duckImage,
  duckImagePath,
})

createMixTests({
  describe,
  it,
  assert,
  expect,
  fs,
  duckImage,
  duckImagePath,
})
