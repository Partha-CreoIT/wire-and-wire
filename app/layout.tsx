import type { Metadata } from 'next';
import './globals.css';
import { MotionProvider } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.wireproducts.cc'),
  title: {
    default: 'Wire & Wire Products (M) Sdn. Bhd.',
    template: '%s · Wire & Wire Products',
  },
  description:
    'Manufacturer of PC strand, PC wire, PC bar and galvanised strand for ' +
    'pre-stressed concrete. The tension steel inside 23 landmark structures ' +
    'across Malaysia, Singapore, Indonesia and the UAE.',
  openGraph: {
    type: 'website',
    siteName: 'Wire & Wire Products (M) Sdn. Bhd.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Atlas paints the canvas instantly so it is never blank. */}
        <link
          rel="preload"
          as="image"
          href="/film/d-atlas.webp"
          fetchPriority="high"
          media="(min-width: 820px)"
        />
        <link
          rel="preload"
          as="image"
          href="/film/m-atlas.webp"
          fetchPriority="high"
          media="(max-width: 819px)"
        />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
