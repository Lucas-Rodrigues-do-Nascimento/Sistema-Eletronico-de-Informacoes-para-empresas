/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
  // ... você pode adicionar outras configurações Next.js aqui

  webpack(config: any, { isServer }: { isServer: boolean }) {
    if (!isServer) {
      // Alias 'canvas' para false para não tentar resolver no browser
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      // Fallbacks para módulos Node-only
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
      // IgnorePlugin para suprimir require('canvas') em pdfjs-dist
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^canvas$/,
          contextRegExp: /pdfjs-dist/
        })
      );
    }
    return config;
  },
};

// Extendendo o webpack config para ignorar módulos Node-only no bundle cliente
nextConfig.webpack = (config, { isServer }) => {
  if (!isServer) {
    // Alias 'canvas' para false para não tentar resolver no browser
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    // Fallbacks para módulos Node-only
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    // IgnorePlugin para suprimir require('canvas') em pdfjs-dist
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^canvas$/,
        contextRegExp: /pdfjs-dist/
      })
    );
  }
  return config;
};

module.exports = nextConfig;
