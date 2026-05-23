import wretch from "../../src/index.js"

type Data = { value: number }

// Without catchers, the body type should be exactly what the parser returns.
async function regularType() {
  const result = await wretch("https://example.com").get().json<Data>()
  const expected: Data = result
  return { expected }
}

// Response-chain catchers should widen the final body type.
async function responseChainCatcherType() {
  const result = await wretch("https://example.com")
    .get()
    .notFound(() => "notFound" as const)
    .json<Data>()

  const expected: Data | "notFound" = result
  // @ts-expect-error result can also be the catcher return value
  const wrong: Data = result

  return { expected, wrong }
}

// A catcher with no explicit return still resolves the promise with
// `undefined`, so the body type must include it.
async function voidCatcherType() {
  const result = await wretch("https://example.com")
    .get()
    .notFound(() => {})
    .json<Data>()

  const expected: Data | undefined = result

  return { expected }
}

// Catchers that only throw must not widen the resolved type to `undefined`.
async function throwingCatcherType() {
  const result = await wretch("https://example.com")
    .get()
    .notFound(async () => {
      throw new Error("still failing")
    })
    .json<Data>()

  const expected: Data = result

  return { expected }
}

// Multiple catchers should widen the body type with the union of all their return values,
// even if they are registered at different stages of the chain.
async function multipleCatchersType() {
  const result = await wretch("https://example.com")
    .catcher(404, () => "404" as const)
    .catcher([401, 403, 407], () => "401/403/407" as const)
    .catcherFallback(() => "fallback" as const)
    .get()
    .notFound(() => "notFound" as const)
    .internalError(() => "internalError" as const)
    .error("custom", () => "customError" as const)
    .fetchError(() => "Fetch error" as const)
    .json<Data>()

  const expected:
    Data
    | "404"
    | "401/403/407"
    | "fallback"
    | "notFound"
    | "internalError"
    | "customError"
    | "Fetch error" = result
  // @ts-expect-error result can also be the catcher return values
  const wrong: Data = result

  return { expected, wrong }
}

// Catchers introduced inside `.defer(...)` happen late at runtime but must be
// reflected early in the static type.
async function deferredCatcherType() {
  const api = wretch("https://example.com")
    .defer(w => w.catcher(404, () => "deferred" as const))

  const result = await api.get().json<Data>()

  const expected: Data | "deferred" = result
  // @ts-expect-error result can also be the deferred catcher return value
  const wrong: Data = result

  return { expected, wrong }
}

// Request-level catchers must survive when the final body parser is installed
// through `.resolve(...)`.
function resolverRequestCatcherType() {
  const api = wretch("https://example.com")
    .catcher(404, () => "requestCatcher" as const)
    .resolve(chain => chain.json<Data>())

  const result = api.get()

  const expected: Promise<Data | "requestCatcher"> = result
  // @ts-expect-error resolver return type should include request-level catcher results
  const wrong: Promise<Data> = result

  return { expected, wrong }
}

// Catchers registered from inside `.resolve(...)` should also widen the final
// resolver return type.
function resolverResponseCatcherType() {
  const api = wretch("https://example.com")
    .resolve(chain => chain.notFound(() => "resolvedCatcher" as const).json<Data>())

  const result = api.get()

  const expected: Promise<Data | "resolvedCatcher"> = result
  // @ts-expect-error resolver return type should include response-chain catcher results
  const wrong: Promise<Data> = result

  return { expected, wrong }
}

// `.defer(...)` and `.resolve(...)` should compose: deferred catchers still
// affect the promise returned by the resolver.
function deferredResolverType() {
  const api = wretch("https://example.com")
    .defer(w => w.catcher(404, () => "deferredResolver" as const))
    .resolve(chain => chain.json<Data>())

  const result = api.get()

  const expected: Promise<Data | "deferredResolver"> = result
  // @ts-expect-error resolver return type should include deferred catcher results
  const wrong: Promise<Data> = result

  return { expected, wrong }
}

// Keep the helpers referenced so the file is checked but never executed.
void [
  regularType,
  responseChainCatcherType,
  voidCatcherType,
  throwingCatcherType,
  multipleCatchersType,
  deferredCatcherType,
  resolverRequestCatcherType,
  resolverResponseCatcherType,
  deferredResolverType,
]
