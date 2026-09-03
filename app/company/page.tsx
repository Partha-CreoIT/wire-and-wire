import type { Metadata } from 'next';
import { CompanyPageContent } from '@/components/PageContent';

export const metadata: Metadata = {
  title: 'Company',
  description:
    'Company profile, governance, CSR archive and regional presence for Wire & Wire Products.',
};

export default function CompanyPage() {
  return <CompanyPageContent />;
}
