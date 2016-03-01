module.exports = {
  resolve: {
    extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
  },
  entry: './src/main.ts',
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js'
  },
  module: {
      loaders: [
          {
              test: /\.ts$/,
              loader: 'awesome-typescript-loader'
          },
          { test: /dateformat/, loader: 'imports?define=>false' }
      ]
  },
  node: {
      fs: "empty"
  }
};
