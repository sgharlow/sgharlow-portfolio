import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { TopNav } from '@/components/TopNav';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans-loaded' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-loaded' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.learningai365.com';

export const metadata: Metadata = {
  title: 'sgharlow — the lab',
  description: 'AI learning projects — agents, MCP servers, products, research, tooling.',
  metadataBase: new URL(SITE_URL),
  openGraph: { type: 'website', url: SITE_URL, siteName: 'sgharlow' },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Steve Gharlow',
  alternateName: 'sgharlow',
  url: SITE_URL,
  sameAs: [
    'https://github.com/sgharlow',
    'https://www.linkedin.com/in/sgharlow/',
  ],
  jobTitle: 'AI engineer',
  knowsAbout: [
    'AI agents',
    'Model Context Protocol',
    'large language models',
    'retrieval-augmented generation',
    'tool calling',
    'TypeScript',
    'Python',
    'AWS',
  ],
  mainEntityOfPage: SITE_URL,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'sgharlow — the lab',
  url: SITE_URL,
  description:
    'AI learning projects — agents, MCP servers, products, research, tooling.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <div className="max-w-6xl mx-auto px-6 py-5">
          <TopNav />
          {children}
        </div>
      </body>
    </html>
  );
}
