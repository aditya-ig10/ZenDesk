/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_INFURA_PROJECT_ID: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
    NEXT_PUBLIC_INFURA_PROJECT_SECRET: process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET,
  },
  async rewrites() {
    return [
      {
        source: '/tokens',
        destination: '/tokens',
        
      },
    ];
  },
  
};

module.exports = nextConfig;