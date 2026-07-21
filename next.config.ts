import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove "output: export" to enable API routes on Vercel
  // Static export is only for GitHub Pages (which we're not using anymore)

  // Disabled for react-three-fiber: StrictMode's dev-only double-mount tears
  // down and recreates the WebGL context, which the About window's <Lanyard />
  // canvas does not recover from (blank card, lost GL context). No effect on
  // the production build, which never double-invokes.
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
