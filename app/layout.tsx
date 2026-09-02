import type { Metadata, Viewport } from 'next';
import { Archivo, Archivo_Narrow } from 'next/font/google';
import './globals.css';
import { MotionProvider } from './providers';

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
