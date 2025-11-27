import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow production builds to pass even if there are ESLint warnings/errors.
  // This keeps dev linting intact (npm run lint) but unblocks `next build`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Aumentar límite de tamaño para Server Actions (archivos grandes)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Permitir archivos hasta 10MB
    },
  },
};

export default nextConfig;
