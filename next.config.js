/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix for circular dependencies
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      module: false,
    };
    
    // Turn off webpack's circular dependency warning
    config.ignoreWarnings = [/circular dependency/];
    
    return config;
  },
};

module.exports = nextConfig;