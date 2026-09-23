import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Files are bundled into the server route, never exposed under /public.
  outputFileTracingIncludes: {
    "/api/media/*": ["./src/lib/media/demo-assets/**/*"],
  },
};

export default nextConfig;
