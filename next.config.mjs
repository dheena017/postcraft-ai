/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/overview',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/sheets',
        destination: '/studio?mode=sheets',
        permanent: false,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'node:fs': false,
        'node:path': false,
        'node:sqlite': false,
      };
    }
    return config;
  },
};

export default nextConfig;
