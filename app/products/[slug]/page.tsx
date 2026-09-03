import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductFamilyPageContent } from '@/components/PageContent';
import { ProductFamilyWorldFilm } from '@/components/ProductWorldFilm';
import { productFamilies } from '@/lib/siteContent';

type ProductPageParams = {
  params: Promise<{ slug: string }>;
};

function getFamily(slug: string) {
  return productFamilies.find((family) => family.slug === slug);
}

export const dynamicParams = false;

export function generateStaticParams() {
  return productFamilies.map((family) => ({ slug: family.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageParams): Promise<Metadata> {
  const { slug } = await params;
  const family = getFamily(slug);

  if (!family) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: family.name,
    description: family.summary,
  };
}

export default async function ProductFamilyPage({ params }: ProductPageParams) {
  const { slug } = await params;
  const family = getFamily(slug);

  if (!family) notFound();

  return (
    <>
      <ProductFamilyWorldFilm family={family} />
      <ProductFamilyPageContent family={family} />
    </>
  );
}
