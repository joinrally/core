/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: 'b.tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: 'c.tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
    ],
  },
}

module.exports = nextConfig

