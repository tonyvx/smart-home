const path = require("path");


module.exports = {
  entry: "./src/index.js",
  output: {
    // NEW
    path: path.join(__dirname,"../public"),
    filename: "react.js",
  }, // NEW Ends

  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /spec\.js$/,
        use: "mocha-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
