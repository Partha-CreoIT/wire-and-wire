import type { Metadata } from 'next';
import { ProjectsPageContent } from '@/components/PageContent';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Reference infrastructure, tower, transport and civic projects supplied by Wire & Wire Products.',
};

export default function ProjectsPage() {
  return <ProjectsPageContent />;
}
