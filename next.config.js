/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: '@svgr/webpack',
    })
    return config
  },
  i18n,
  // Transpile Swagger UI React https://github.com/swagger-api/swagger-ui/issues/8245
  transpilePackages: ['react-syntax-highlighter', 'swagger-client', 'swagger-ui-react'],
}

module.exports = nextConfig
