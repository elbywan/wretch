import typescript from "rollup-plugin-typescript"
import { terser } from "rollup-plugin-terser"
import nodeResolve from "rollup-plugin-node-resolve"

const addons = ["abort", "formData", "formUrl", "perfs", "queryString"]

const common = {
  plugins: [
    typescript({
      typescript: require("typescript"),
      importHelpers: true
    }),
    nodeResolve(),
    terser({
      output: {
        comments: false
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
      }),
      // For tests
      {
        file: "test/browser/src/wretch.all.min.js",
        format: "umd",
        name: "wretch",
        exports: "default",
        sourcemap: true
      }
    ],
    ...common
  },
  ...addons.map(addon => ({
    input: `./src/addons/${addon}.ts`,
    output: outputs({
      file: `dist/bundle/addons/${addon}.min.js`,
      format: "umd",
      name: `wretchAddon${addon.charAt(0).toLocaleUpperCase() + addon.slice(1)}`,
      exports: "default",
      sourcemap: true
    }),
    ...common
  }))
]