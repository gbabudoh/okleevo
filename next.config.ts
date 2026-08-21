import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {},
  // Suppress Turbopack warnings about middleware
  // Note: middleware.ts is the correct Next.js convention
  onDemandEntries: {
    // Keep pages in memory for 60 seconds
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/auth/login', destination: '/access', permanent: true },
      { source: '/login', destination: '/access', permanent: true },
      { source: '/signin', destination: '/access', permanent: true },
      { source: '/auth/register', destination: '/onboarding', permanent: true },
      { source: '/auth/signup', destination: '/onboarding', permanent: true },
      { source: '/signup', destination: '/onboarding', permanent: true },
      { source: '/register', destination: '/onboarding', permanent: true },
    ];
  },
};

export default nextConfig;
