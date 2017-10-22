const path = require('path')
const appEnv = process.env.APP_ENV || process.env.NODE_ENV || 'development'

let publicPaths = {
  development: '/',
  ghpages: '/copilote/',
  preprod: '/',
  production: '/'
}

module.exports = {
  // Used by the devServer and base href
  public: publicPaths[appEnv] || publicPaths.development,

  // Used by the module bundler
  root: path.join(__dirname, '..'),
  src: path.join(__dirname, '..', 'src'),
  build: path.join(__dirname, '..', 'build'),
  static: path.join(__dirname, '..', 'static'),

  // Generating page from content and layouts
  layouts: path.join(__dirname, '..', 'src', 'templates'),
  partials: path.join(__dirname, '..', 'src', 'templates')
}
