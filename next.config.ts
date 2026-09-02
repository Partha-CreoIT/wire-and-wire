import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Frames are pre-optimised WebP written by scripts/build-hero.sh and are
  // fetched by the scrub worker, never through next/image.
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [
      {
        // 800 immutable frames + atlases. Cache them hard.
        source: '/film/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
