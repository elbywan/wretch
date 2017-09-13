const path = require("path")

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "wretch.js",
        library: "wretch",
        libraryTarget: "umd",
        libraryExport: "default"
    },
    externals: [ "url" ],
    resolve: {
        extensions: [".ts"]
    },
    devtool: "source-map",
    module: {
        loaders: [{
            test: /\.tsx?$/,
            loader: "awesome-typescript-loader",
            options: {
                configFileName: path.resolve(__dirname, "tsconfig.json")
            }
        }]
    }
};