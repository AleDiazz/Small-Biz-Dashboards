/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // Exclude undici from webpack processing
    if (!isServer) {
      config.externals = config.externals || []
      config.externals.push({
        undici: 'undici',
      })
    }
    
    return config
  },
}

module.exports = nextConfig

