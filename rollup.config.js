import typescript from "rollup-plugin-typescript"
import uglify from "rollup-plugin-uglify"
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
            typescript: require("typescript")
        }),
        uglify({}, minify)
    ],
    external: [ "url" ],
    sourcemap: true
}