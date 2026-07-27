import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import './globals.css';
import SwRegister from '@/components/SwRegister';
import messages from '../messages/en.json';

const TITLE = 'Marklet — Free Online Markdown Editor, Share via Link';
const DESCRIPTION =
  'Marklet is a free online markdown editor with live preview. Write markdown and instantly share it as a link — no sign-up, no account, no server. Your content lives in the URL.';

export const metadata: Metadata = {
  metadataBase: new URL('https://marklet.fyi'),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'markdown editor',
    'online markdown editor',
    'free markdown editor',
    'markdown to link',
    'share markdown online',
    'markdown live preview',
    'no signup markdown editor',
    'serverless markdown',
    'markdown URL share',
    'markdown notepad online',
    'markdown editor no account',
    'shareable markdown link',
  ],
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Marklet',
  url: 'https://marklet.fyi',
  description: DESCRIPTION,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Live markdown preview',
    'Share markdown as a URL',
    'No sign-up required',
    'No server or database',
    'Encrypted sharing',
    'Export as PDF or HTML',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
