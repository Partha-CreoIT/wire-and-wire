import type { Metadata } from 'next';
import { AboutPageContent } from '@/components/PageContent';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Meet Dato’ Anathkumar Alagu, CEO of Wire & Wire Products, and discover our steel wire expertise, humanitarian recognition and community initiatives.',
};

export default function AboutPage() {
  return <AboutPageContent />;
}
