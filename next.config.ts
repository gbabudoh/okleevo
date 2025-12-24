import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure we're using App Router
  experimental: {
    // Add any experimental features if needed
  },
  // Suppress Turbopack warnings about middleware
  // Note: middleware.ts is the correct Next.js convention
  onDemandEntries: {
    // Keep pages in memory for 60 seconds
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
};

export default nextConfig;
