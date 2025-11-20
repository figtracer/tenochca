import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Allow importing shared artifacts and utilities from the root project.
     * These files live outside of the /frontend directory.
     */
    externalDir: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/user-attachments/**",
      },
    ],
  },
  transpilePackages: ["@aztec/aztec.js", "@aztec/accounts"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      os: false,
      tls: false,
    };

    return config;
  },
};

export default nextConfig;
