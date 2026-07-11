import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker builds
  output: 'standalone',

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent konva from trying to load node-canvas on the server
      config.externals = [...(config.externals || []), 'canvas', 'konva'];
    }
    return config;
  },
};

export default nextConfig;
