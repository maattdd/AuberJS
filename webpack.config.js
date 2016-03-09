module.exports = {
  resolve: {
    extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
  },
  entry: './src/main.ts',
  devtool: 'source-map',
  output: {
      devtoolLineToLine: true,
      sourceMapFilename: "./bundle.js.map",
      pathinfo: true,
      path: __dirname + '/public',
      filename: 'bundle.js'
  },
  module: {
      loaders: [
          { test: /\.ts$/, loader: 'awesome-typescript-loader'},
          { test: /\.css$/, exclude: /\.useable\.css$/, loader: "style!css" },
          { test: /\.useable\.css$/, loader: "style/useable!css" }
      ]
  },
  plugins: []
};
