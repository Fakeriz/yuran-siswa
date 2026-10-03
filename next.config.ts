import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
    middlewareClientMaxBodySize: "12mb",
  },
};

export default nextConfig;
