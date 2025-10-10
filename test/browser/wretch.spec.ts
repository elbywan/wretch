import { expect, assert, fs } from "./helpers.js"
import { createWretchTests, createMixTests, DescribeFn, ItFn, BeforeFn, BeforeEachFn } from "../shared/wretch.spec.js"

const duckImageResponse = await fetch("/test/assets/duck.jpg")
const duckImageBuffer = await duckImageResponse.arrayBuffer()
const duckImage = new Uint8Array(duckImageBuffer)
const duckImagePath = "/test/assets/duck.jpg"

declare const describe: DescribeFn
declare const it: ItFn
declare const before: BeforeFn
declare const beforeEach: BeforeEachFn

createWretchTests({
  describe,
  it,
  before,
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
