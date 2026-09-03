import type { Metadata } from 'next';
import { ProductsPageContent } from '@/components/PageContent';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'PC strand, PC wire, PC bar, galvanized strand and industrial drawn wire products from Wire & Wire Products.',
};

export default function ProductsPage() {
  return <ProductsPageContent />;
}
