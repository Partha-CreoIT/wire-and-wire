export interface ProductFilmAsset {
  id: string;
  rawClip: string;
  clip: string;
  poster: string;
}

export const productFilmAssets: ProductFilmAsset[] = [
  {
    id: 'pc-strand',
    rawClip: '/world/product-film/beat-1-pc-strand.mp4',
    clip: '/world/product-film/scroll/beat-1-pc-strand.mp4',
    poster: '/world/product-film/posters/beat-1-pc-strand.webp',
  },
  {
    id: 'prestressing',
    rawClip: '/world/product-film/beat-2-prestress.mp4',
    clip: '/world/product-film/scroll/beat-2-prestress.mp4',
    poster: '/world/product-film/posters/beat-2-prestress.webp',
  },
  {
    id: 'pc-wire',
    rawClip: '/world/product-film/beat-3-pc-wire.mp4',
    clip: '/world/product-film/scroll/beat-3-pc-wire.mp4',
    poster: '/world/product-film/posters/beat-3-pc-wire.webp',
  },
  {
    id: 'pc-bar',
    rawClip: '/world/product-film/beat-4-pc-bar.mp4',
    clip: '/world/product-film/scroll/beat-4-pc-bar.mp4',
    poster: '/world/product-film/posters/beat-4-pc-bar.webp',
  },
  {
    id: 'galvanized',
    rawClip: '/world/product-film/beat-5-galvanized.mp4',
    clip: '/world/product-film/scroll/beat-5-galvanized.mp4',
    poster: '/world/product-film/posters/beat-5-galvanized.webp',
  },
  {
    id: 'unbonded-other',
    rawClip: '/world/product-film/beat-6-unbonded-span.mp4',
    clip: '/world/product-film/scroll/beat-6-unbonded-span.mp4',
    poster: '/world/product-film/posters/beat-6-unbonded-span.webp',
  },
];

const familyFilmIds: Record<string, string> = {
  'pc-strand': 'pc-strand',
  'pc-wire': 'pc-wire',
  'pc-bar': 'pc-bar',
  'galvanized-strand-wire': 'galvanized',
  'other-wires': 'unbonded-other',
};

export function productFilmAssetForFamily(slug: string): ProductFilmAsset {
  const id = familyFilmIds[slug] ?? 'unbonded-other';
  return productFilmAssets.find((asset) => asset.id === id) ?? productFilmAssets[0];
}

export function hdImage(src?: string): string {
  if (!src) return '/world/products/other-wires.webp';

  const match = src.match(/^\/legacy\/images\/(.+)\.(png|jpe?g)$/i);
  if (!match) return src;

  return `/legacy-hd/images/${match[1]}.webp`;
}

export function projectGeneratedImage(slug: string): string {
  return `/generated/projects/${slug}.webp`;
}

const companyCsrImages: Record<string, string> = {
  '/legacy/images/csr/csr6.png': '/generated/company/sin-chew-foundation-donation.webp',
  '/legacy/images/csr/csr3.png': '/generated/company/atmah-foundation-support.webp',
  '/legacy/images/csr/csr4.png': '/generated/company/melvin-jones-humanitarian-award.webp',
  '/legacy/images/csr/csr5.png': '/generated/company/feed-the-needy-programme.webp',
  '/legacy/images/csr/csr1.png': '/generated/company/sight-conservation.webp',
  '/legacy/images/csr/csr7.png': '/generated/company/childrens-carnival-talent.webp',
  '/legacy/images/stories/1.jpg': '/generated/company/home-refurbishment.webp',
  '/legacy/images/stories/4.jpg': '/generated/company/wwp-ponggal-carnival-2017.webp',
};

export function companyCsrImage(src: string): string {
  return companyCsrImages[src] ?? hdImage(src);
}
