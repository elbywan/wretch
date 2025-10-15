import { describe, it, beforeEach } from "bun:test"
import { expect, assert, fs } from "./helpers"
import { createWretchTests, createMixTests } from "../shared/wretch.spec"

const duckImagePath = new URL("../assets/duck.jpg", import.meta.url).pathname
const duckImage = await Bun.file(duckImagePath).arrayBuffer().then(buf => new Uint8Array(buf))

createWretchTests({
  describe,
  it,
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
