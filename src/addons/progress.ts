import type { ConfiguredMiddleware, Wretch, WretchAddon, WretchResponseChain } from "../types.js"

export type ProgressCallback = (loaded: number, total: number) => void

export interface ProgressResolver {
  /**
   * Provides a way to register a callback to be invoked one or multiple times during the download.
   * The callback receives the current progress as two arguments, the number of bytes downloaded and the total number of bytes to download.
   *
   * _Under the hood: this method adds a middleware to the chain that will intercept the response and replace the body with a new one that will emit the progress event._
   *
   * ```js
   * import ProgressAddon from "wretch/addons/progress"
   *
   * wretch("some_url")
   *   .addon(ProgressAddon())
   *   .get()
   *   .progress((loaded, total) => console.log(`${(loaded / total * 100).toFixed(0)}%`))
   * ```
   *
   * @param onProgress - A callback function for download progress
   */
  progress: <T, C extends ProgressResolver, R>(
    this: C & WretchResponseChain<T, C, R>,
    onProgress: ProgressCallback
  ) => this
}

export interface ProgressAddon {
  /**
   * Provides a way to register a callback to be invoked one or multiple times during the upload.
   * The callback receives the current progress as two arguments, the number of bytes uploaded and the total number of bytes to upload.
   *
   * **Browser Limitations:**
   * - **Firefox**: Does not support request body streaming (request.body is not readable). Upload progress monitoring will not work.
   * - **Chrome/Chromium**: Requires HTTPS connections (HTTP/2). Will fail with `ERR_ALPN_NEGOTIATION_FAILED` on HTTP servers.
   * - **Node.js**: Full support for both HTTP and HTTPS.
   *
   * _Compatible with platforms implementing the [TransformStream WebAPI](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream#browser_compatibility) and supporting request body streaming._
   *
   * ```js
   * import ProgressAddon from "wretch/addons/progress"
   *
   * wretch("https://example.com/upload") // Note: HTTPS required for Chrome
   *   .addon(ProgressAddon())
   *   .onUpload((loaded, total) => console.log(`Upload: ${(loaded / total * 100).toFixed(0)}%`))
   *   .post(formData)
   *   .res()
   * ```
   *
   * @param onUpload - A callback that will be called one or multiple times with the number of bytes uploaded and the total number of bytes to upload.
   */
  onUpload<T extends ProgressAddon, C, R, E>(this: T & Wretch<T, C, R, E>, onUpload: (loaded: number, total: number) => void): this

  /**
   * Provides a way to register a callback to be invoked one or multiple times during the download.
   * The callback receives the current progress as two arguments, the number of bytes downloaded and the total number of bytes to download.
   *
   * _Compatible with all platforms implementing the [TransformStream WebAPI](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream#browser_compatibility)._
   *
   * ```js
   * import ProgressAddon from "wretch/addons/progress"
   *
   * wretch("some_url")
   *   .addon(ProgressAddon())
   *   .onDownload((loaded, total) => console.log(`Download: ${(loaded / total * 100).toFixed(0)}%`))
   *   .get()
   *   .res()
   * ```
   *
   * @param onDownload - A callback that will be called one or multiple times with the number of bytes downloaded and the total number of bytes to download.
   */
  onDownload<T extends ProgressAddon, C, R, E>(this: T & Wretch<T, C, R, E>, onDownload: (loaded: number, total: number) => void): this
}

function toStream<T extends Request | Response>(requestOrResponse: T, bodySize: number, callback: ProgressCallback | undefined): T {
  try {
    const contentLength = requestOrResponse.headers.get("content-length")
    let total = bodySize || (contentLength ? +contentLength : 0)
    let loaded = 0
    const transform = new TransformStream({
      start() {
        callback?.(loaded, total)
      },
      transform(chunk, controller) {
        loaded += chunk.length
        if (total < loaded) {
          total = loaded
        }
        callback?.(loaded, total)
        controller.enqueue(chunk)
      }
    })

    const stream = requestOrResponse.body.pipeThrough(transform)

    if("status" in requestOrResponse) {
      return new Response(stream, requestOrResponse) as T
    } else {
      // @ts-expect-error RequestInit does not yet include duplex
      return new Request(requestOrResponse, { body: stream, duplex: "half" }) as T
    }
  } catch {
    return requestOrResponse
  }
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
const progress: () => WretchAddon<ProgressAddon, ProgressResolver> = () => {
  function downloadMiddleware(state: Record<any, any>) : ConfiguredMiddleware {
    return next => (url, opts) => {
      return next(url, opts).then(response => {
        if (!state.progress) {
          return response
        }
        return toStream(response, 0, state.progress)
      })
    }
  }

  function uploadMiddleware(state: Record<any, any>): ConfiguredMiddleware {
    return next => async (url, opts) => {
      const body = opts.body

      if (!body || !state.upload) {
        return next(url, opts)
      }

      let bodySize: number = 0

      try {
        bodySize = (await new Request("a:", { method: "POST", body }).blob()).size
      } catch {
        // Unable to determine body size
      }

      const request = toStream(new Request(url, opts), bodySize, state.upload)
      return next(request.url, request)
    }
  }

  return {
    beforeRequest(wretch, options, state) {
      const middlewares = []
      if (options.__uploadProgressCallback) {
        state.upload = options.__uploadProgressCallback
        delete options.__uploadProgressCallback
      }
      if (options.__downloadProgressCallback) {
        state.progress = options.__downloadProgressCallback
        delete options.__downloadProgressCallback
      }
      middlewares.push(uploadMiddleware(state))
      middlewares.push(downloadMiddleware(state))
      return wretch.middlewares(middlewares)
    },
    wretch: {
      onUpload(onUpload: (loaded: number, total: number) => void) {
        return this.options({ __uploadProgressCallback: onUpload })
      },
      onDownload(onDownload: (loaded: number, total: number) => void) {
        return this.options({ __downloadProgressCallback: onDownload })
      }
    },
    resolver: {
      progress(onProgress: ProgressCallback) {
        this._sharedState.progress = onProgress
        return this
      }
    },
  }
}

export default progress
