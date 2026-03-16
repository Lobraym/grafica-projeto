import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'react-apexcharts', 'framer-motion'],
  },
};

export default nextConfig;
