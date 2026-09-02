import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Frames are pre-optimised WebP written by scripts/build-hero.sh and are
  // fetched by the scrub worker, never through next/image.
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    // In production the frames are immutable and cached hard.
    //
    // In DEVELOPMENT they must NOT be. Every Next project on this machine is
    // served from the same http://localhost:3000 origin, so /film/d/001.webp
    // is the same cache key for all of them. `immutable` tells Chrome never to
    // revalidate, so one project's frames get pinned for a year and then
    // rendered inside a different project. That is exactly what happened:
    // temple footage from another localhost:3000 project painted into this
    // hero while the server was serving the correct bridge frames.
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/film/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isProd
              ? 'public, max-age=31536000, immutable'
              : 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
