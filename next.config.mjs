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
};

export default nextConfig;
