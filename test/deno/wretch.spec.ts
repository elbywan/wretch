import { describe, it, beforeEach } from "@std/testing/bdd"
import { expect, assert, fs } from "./helpers.ts"
import { createWretchTests, createMixTests } from "../shared/wretch.spec.ts"

const duckImagePath = new URL("../assets/duck.jpg", import.meta.url).pathname
const duckImage = await Deno.readFile(duckImagePath)

createWretchTests({
  describe: (name, fn) => describe(name, { sanitizeResources: false }, fn),
  it: (name, fn) => it(name, { sanitizeResources: false }, fn),
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
