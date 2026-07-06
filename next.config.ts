import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove "output: export" to enable API routes on Vercel
  // Static export is only for GitHub Pages (which we're not using anymore)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
