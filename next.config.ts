import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The MCP SDK is only used server-side; keep it external to the client bundle.
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
  // Clean URL for the human console (the friend's design lives in public/console).
  async rewrites() {
    return [{ source: "/console", destination: "/console/index.html" }];
  },
  // The deployed product opens on the human console.
  async redirects() {
    return [{ source: "/", destination: "/console", permanent: false }];
  },
};

export default nextConfig;
