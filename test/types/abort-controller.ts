import wretch from "../../src/index.js"
import AbortAddon from "../../src/addons/abort.js"

// `.controller()` returns the request's AbortController paired with the response
// chain. The first element must be typed as `AbortController` — not `any` — so
// that `.abort()`, `.signal`, etc. are statically checked at the call site.
async function controllerReturnType() {
  const [controller, chain] = wretch("https://example.com")
    .addon(AbortAddon())
    .get()
    .controller()

  // The controller exposes the real AbortController surface.
  const expected: AbortController = controller
  const signal: AbortSignal = controller.signal
  controller.abort()

  // @ts-expect-error the controller is an `AbortController`, not `any`, so
  // accessing a member that does not exist on it is a type error.
  controller.notAnAbortControllerMethod()

  // The second element is still the response chain and keeps its methods.
  void chain.onAbort(() => {})

  return { expected, signal }
}

// Keep the helper referenced so the file is checked but never executed.
void [controllerReturnType]
