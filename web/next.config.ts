import type { NextConfig } from "next";

const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const INTERNAL_API_URL = (process.env.INTERNAL_API_URL ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  env: {
    NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    if (!INTERNAL_API_URL || NEXT_PUBLIC_API_URL) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${INTERNAL_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
