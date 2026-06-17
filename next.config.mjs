/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  allowedDevOrigins: ['192.168.1.119', 'localhost:3000'],
}

export default nextConfig;
