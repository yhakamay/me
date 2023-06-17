/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './src/utils/image-loader.js'
  }
};

module.exports = nextConfig;
