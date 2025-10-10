import { playwrightLauncher } from "@web/test-runner-playwright"
import { esbuildPlugin } from "@web/dev-server-esbuild"

export default {
  files: "test/browser/**/*.spec.js",
  nodeResolve: true,
  concurrency: 1,
  browsers: [
    playwrightLauncher({ product: "chromium" }),
    playwrightLauncher({ product: "firefox" }),
    ...(globalThis.process.env.CI ? [playwrightLauncher({ product: "webkit" })]: []),
  ],
  testFramework: {
    config: {
      timeout: 10000,
    },
  },
  plugins: [
    esbuildPlugin({
      ts: false,
      target: "auto"
    })
  ],
}
