import type { Metadata } from 'next';
import { AboutPageContent } from '@/components/PageContent';

export const metadata: Metadata = {
  title: 'About',
  description:
    'The team, message from the CEO, corporate directory, governance and CSR archive of Wire & Wire Products.',
};

export default function AboutPage() {
  return <AboutPageContent />;
}
