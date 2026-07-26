import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import './globals.css';
import SwRegister from '@/components/SwRegister';
import messages from '../messages/en.json';

const TITLE = 'Marklet — write markdown, carry it in the link';
const DESCRIPTION =
  'A zero-server markdown editor. Write in Markdown and share via a self-contained URL — no accounts, no database, no sync.';

export const metadata: Metadata = {
  metadataBase: new URL('https://marklet.fyi'),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    siteName: 'Marklet',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: TITLE }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body>
        <NextIntlClientProvider locale="en" messages={messages}>
          {children}
          <SwRegister />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
