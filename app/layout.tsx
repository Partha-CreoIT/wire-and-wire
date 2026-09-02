import type { Metadata, Viewport } from 'next';
import { Archivo, Archivo_Narrow } from 'next/font/google';
import './globals.css';
import { MotionProvider } from './providers';

const siteUrl =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wireproduct.creox.dev';
const siteName = 'Wire & Wire Products (M) Sdn. Bhd.';
const siteDescription =
  'Manufacturer of PC strand, PC wire, PC bar and galvanised strand for ' +
  'pre-stressed concrete. The tension steel inside 23 landmark structures ' +
  'across Malaysia, Singapore, Indonesia and the UAE.';
const socialPreviewImage = {
  url: '/social-preview.jpg',
  width: 1200,
  height: 630,
  alt: 'Pre-stressed steel strand, wire drawing mill and landmark structures.',
};

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo-narrow',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  title: {
    default: siteName,
    template: '%s · Wire & Wire Products',
  },
  description: siteDescription,
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: '/',
    type: 'website',
    siteName,
    locale: 'en_US',
    images: [socialPreviewImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [socialPreviewImage],
  },
};

export const viewport: Viewport = {
  // viewport-fit=cover so the film's copy can use safe-area insets on phones.
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${archivoNarrow.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
