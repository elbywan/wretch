import typescript from "rollup-plugin-typescript"
import { terser } from "rollup-plugin-terser"
import nodeResolve from "rollup-plugin-node-resolve"

const addons = ["abort", "formData", "formUrl", "perfs", "queryString"]
const middlewares = ["dedupe", "delay", "retry", "throttlingCache"]

const common = {
  plugins: [
    typescript({
      typescript: require("typescript"),
      importHelpers: true
    }),
    nodeResolve(),
    terser({
      ecma: 2018,
      output: {
        comments: false,
      },
      compress: {
        booleans_as_integers: true,
        passes: 2
      }
    })
  ],
  external: ["url"]
}

const formats = ["umd", "cjs", "esm"]
const outputs = output => formats.map(format => ({
  ...output,
  format,
  file:
    format === "cjs" ? output.file.replace(".js", ".cjs") :
      format === "esm" ? output.file.replace(".js", ".mjs") :
        output.file
}))

export default [
  {
    input: "./src/index.ts",
    output: outputs({
      file: "dist/bundle/wretch.min.js",
      format: "umd",
      name: "wretch",
      exports: "default",
      sourcemap: true
    }),
    ...common
  },
  {
    input: "./src/index.all.ts",
    output: [
      ...outputs({
        file: "dist/bundle/wretch.all.min.js",
        format: "umd",
        name: "wretch",
        exports: "default",
        sourcemap: true
      })
    ],
    ...common
  },
  ...addons.map(addon => ({
    input: `./src/addons/${addon}.ts`,
    output: outputs({
      file: `dist/bundle/addons/${addon}.min.js`,
      format: "umd",
      name: `wretch${addon.charAt(0).toLocaleUpperCase() + addon.slice(1)}Addon`,
      exports: "default",
      sourcemap: true
    }),
    ...common
  })),
  ...middlewares.map(middleware => ({
    input: `./src/middlewares/${middleware}.ts`,
    output: outputs({
      file: `dist/bundle/middlewares/${middleware}.min.js`,
      format: "umd",
      name: `wretch${middleware.charAt(0).toLocaleUpperCase() + middleware.slice(1)}Middleware`,
      exports: "named",
      sourcemap: true
    }),
    ...common
  }))
]
