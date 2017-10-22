const path = require('path')
const paths = require('./paths.config')
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin')

module.exports = {
  entry: [
    path.join(paths.src, 'entry.js'),
    path.join(paths.src, 'entry.scss')
  ],
  output: {
    publicPath: paths.public,
    filename: '[hash].js',
    chunkFilename: '[hash].[id].chunk.js'
  },
  resolve: {
    plugins: [
      new DirectoryNamedWebpackPlugin({
        include: [
          path.join(paths.src, 'components'),
          path.join(paths.src, 'abstractions'),
          path.join(paths.src, 'controllers')
        ]
      })
    ],
    alias: {
      components: path.join(paths.src, 'components'),
      abstractions: path.join(paths.src, 'abstractions'),
      controllers: path.join(paths.src, 'controllers'),
      utils: path.join(paths.src, 'utils'),
      style: path.join(paths.src, 'style'),
      config: path.join(paths.src, 'config.js')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        include: paths.src
      }
    ]
  },
  plugins: []
}
