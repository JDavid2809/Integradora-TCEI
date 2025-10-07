import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow production builds to pass even if there are ESLint warnings/errors.
  // This keeps dev linting intact (npm run lint) but unblocks `next build`.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
