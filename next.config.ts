import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production verification from overwriting a running development server.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  outputFileTracingRoot: path.resolve(__dirname),
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }]
  }
};

export default nextConfig;
