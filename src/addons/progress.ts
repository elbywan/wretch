import type { ConfiguredMiddleware, Wretch, WretchAddon, WretchOptions, WretchResponseChain } from "../types.js"

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

const defaultGetUploadTotal = async (url: string, opts: WretchOptions): Promise<number> => {
  let total =
          opts.body instanceof ArrayBuffer ? +opts.body.byteLength :
            opts.body instanceof Blob ? +opts.body.size :
              0
  try {
    // Try to determine body size by reading it as a blob
    total ||= (await new Request(url, opts).blob()).size
  } catch {
    // Cannot determine body size
  }

  return total
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
const progress: (options?: {
  /**
   * Function used to determine the total upload size before streaming the request body.
   * Receives the final request URL and options, returns the total byte size (sync or async). Defaults to trying the `byteLength` property
   * for `ArrayBuffer` and the `.size` property for `Blob` (e.g., `FormData` or `File`), then falling back to `Request#blob()` when available.
   *
   * _Note_: The fallback of using `Request#blob()` is memory consuming as it loads the entire body into memory.
   *
   * @param url The request URL
   * @param opts The request options
   * @returns The total upload size in bytes
   */
  getUploadTotal?: (url: string, opts: WretchOptions) => number | Promise<number>
}) => WretchAddon<ProgressAddon, ProgressResolver> = ({
  getUploadTotal = defaultGetUploadTotal
} = {}) => {
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

      const streameableRequest = toStream(
        new Request(url, opts),
        await getUploadTotal(url, opts), state.upload
      )
      return next(url, streameableRequest)
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
