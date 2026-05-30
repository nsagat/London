import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The MCP SDK is only used server-side; keep it external to the client bundle.
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
  // Clean URL for the human console (the friend's design lives in public/console).
  async rewrites() {
    return [{ source: "/console", destination: "/console/index.html" }];
  },
};

export default nextConfig;
