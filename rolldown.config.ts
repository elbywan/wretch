import { defineConfig, OutputOptions } from "rolldown"

const addons = ["abort", "basicAuth", "formData", "formUrl", "perfs", "queryString", "progress"]
const middlewares = ["dedupe", "delay", "retry", "throttlingCache"]

const formats = ["umd", "cjs", "esm"] as const

function outputs(base: OutputOptions): OutputOptions[] {
  return formats.map<OutputOptions>(format => ({
    ...base,
    format,
    minify: true,
    sourcemap: true,
    file:
      format === "cjs" ? base.file?.replace(".js", ".cjs") :
        format === "esm" ? base.file?.replace(".js", ".mjs") :
          base.file
  }))
}

export default defineConfig([
  {
    input: "./src/index.ts",
    output: outputs({
      file: "dist/bundle/wretch.min.js",
      name: "wretch",
      exports: "default",
    }),
    external: ["url"]
  },
  {
    input: "./src/index.all.ts",
    output: outputs({
      file: "dist/bundle/wretch.all.min.js",
      name: "wretch",
      exports: "default",
    }),
    external: ["url"]
  },
  ...addons.map(addon => ({
    input: `./src/addons/${addon}.ts`,
    output: outputs({
      file: `dist/bundle/addons/${addon}.min.js`,
      name: `wretch${addon.charAt(0).toLocaleUpperCase() + addon.slice(1)}Addon`,
      exports: "default",
    }),
    external: ["url"]
  })),
  ...middlewares.map(middleware => ({
    input: `./src/middlewares/${middleware}.ts`,
    output: outputs({
      file: `dist/bundle/middlewares/${middleware}.min.js`,
      name: `wretch${middleware.charAt(0).toLocaleUpperCase() + middleware.slice(1)}Middleware`,
      exports: "named",
    }),
    external: ["url"]
  }))
])
