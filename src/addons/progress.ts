import type { ConfiguredMiddleware, WretchAddon, WretchResponseChain } from "../types.js"

export interface ProgressResolver {
  /**
   * Provides a way to register a callback to be invoked one or multiple times during the download.
   * The callback receives the current progress as two arguments, the number of bytes loaded and the total number of bytes to load.
   *
   * _Under the hood: this method adds a middleware to the chain that will intercept the response and replace the body with a new one that will emit the progress event._
   *
   * ```js
   * import ProgressAddon from "wretch/addons/progress"
   *
   * wretch("some_url")
   *   // Register the addon
   *   .addon(ProgressAddon())
   *   .get()
   *   // Log the progress as a percentage of completion
   *   .progress((loaded, total) => console.log(`${(loaded / total * 100).toFixed(0)}%`))
   * ```
   *
   * @param onProgress - A callback that will be called one or multiple times with the number of bytes loaded and the total number of bytes to load.
   */
  progress: <T, C extends ProgressResolver, R>(
    this: C & WretchResponseChain<T, C, R>,
    onProgress: (loaded: number, total: number) => void
  ) => this
}

/**
 * Adds the ability to monitor progress when downloading a response.
 *
 * _Compatible with all platforms implementing the [TransformStream WebAPI](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream#browser_compatibility)._
 *
 * ```js
 * import ProgressAddon from "wretch/addons/progress"
 *
 * wretch("some_url")
 *   // Register the addon
 *   .addon(ProgressAddon())
 *   .get()
 *   // Log the progress as a percentage of completion
 *   .progress((loaded, total) => console.log(`${(loaded / total * 100).toFixed(0)}%`))
 * ```
 */
const progress: () => WretchAddon<unknown, ProgressResolver> = () => {
  function transformMiddleware(state: Record<any, any>) : ConfiguredMiddleware {
    return next => (url, opts) => {
      let loaded = 0
      let total = 0
      return next(url, opts).then(response => {
        try {
          const contentLength = response.headers.get("content-length")
          total = contentLength ? +contentLength : null
          const transform = new TransformStream({
            transform(chunk, controller) {
              loaded += chunk.length
              if (total < loaded) {
                total = loaded
              }
              if (state.progress) {
                state.progress(loaded, total)
              }
              controller.enqueue(chunk)
            }
          })
          return new Response(response.body.pipeThrough(transform), response)
        } catch {
          return response
        }
      })
    }
  }

  return {
    beforeRequest(wretch, _, state) {
      return wretch.middlewares([transformMiddleware(state)])
    },
    resolver: {
      progress(onProgress: (loaded: number, total: number) => void) {
        this._sharedState.progress = onProgress
        return this
      }
    },
  }
}

export default progress
