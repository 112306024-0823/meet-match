/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/vote/:id',
        destination: '/events/:id?tab=vote',
        permanent: true,
      },
      {
        source: '/create/success/:id',
        destination: '/events/:id?tab=overview',
        permanent: true,
      },
      {
        source: '/results/:id',
        destination: '/events/:id?tab=results',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
