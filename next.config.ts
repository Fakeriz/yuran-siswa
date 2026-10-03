import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
    middlewareClientMaxBodySize: "12mb",
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    const { setupDevPlatform } = await import("@cloudflare/next-on-pages/next-dev");
    await setupDevPlatform();
  }
  return nextConfig;
}
