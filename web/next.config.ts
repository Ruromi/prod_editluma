import type { NextConfig } from "next";

const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const INTERNAL_API_URL = (process.env.INTERNAL_API_URL ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  env: {
    NEXT_PUBLIC_API_URL,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
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
