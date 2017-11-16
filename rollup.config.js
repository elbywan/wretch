import typescript from "rollup-plugin-typescript"
import uglify from "rollup-plugin-uglify"
import nodeResolve from "rollup-plugin-node-resolve"
import { minify } from "uglify-es"

export default {
    input: "./src/index.ts",
    output: {
        file: "dist/bundle/wretch.js",
        format: "umd",
        name: "wretch",
        exports: "default"
    },
    plugins: [
        typescript({
            typescript: require("typescript"),
            importHelpers: true
        }),
        nodeResolve({ jsnext: true, main: true }),
        uglify({}, minify)
    ],
    external: [ "url" ],
    sourcemap: true
}