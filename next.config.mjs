/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allows a production build to run alongside a dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
