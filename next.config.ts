import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The MCP SDK is only used server-side; keep it external to the client bundle.
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
};

export default nextConfig;
