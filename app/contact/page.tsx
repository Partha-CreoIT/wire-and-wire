import type { Metadata } from 'next';
import { ContactPageContent } from '@/components/PageContent';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Office, phone and email details for Wire & Wire Products (M) Sdn. Bhd.',
};

export default function ContactPage() {
  return <ContactPageContent />;
}
