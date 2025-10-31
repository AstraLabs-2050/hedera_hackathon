/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "astralabss3.s3.eu-north-1.amazonaws.com",
      "images.unsplash.com",
      "oaidalleapiprodscus.blob.core.windows.net",
      "res.cloudinary.com",
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore pino-pretty module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
    };
    return config;
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
