const path = require('path')
const paths = require('./paths.config')

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
