/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  swcMinify: true,
  images: {
    loader: 'akamai',
    path: '/',
  },
};

module.exports = nextConfig;
