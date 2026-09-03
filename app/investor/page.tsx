import type { Metadata } from 'next';
import { InvestorPageContent } from '@/components/PageContent';

export const metadata: Metadata = {
  title: 'Investor Relations',
  description:
    'Professional investor information and restrictions for Wire & Wire Products.',
};

export default function InvestorPage() {
  return <InvestorPageContent />;
}
