import type { Metadata } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { TopNav } from '@/components/TopNav';
import { FooterMonetizationBand } from '@/components/FooterMonetizationBand';
import { loadEnrichedProjectsFile } from '@/lib/projects';

const display = Inter_Tight({ subsets: ['latin'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.learningai365.com';

export const metadata: Metadata = {
  title: 'sgharlow — AI learning portfolio',
  description: 'Portfolio of AI learning projects, hackathons, and writing by sgharlow.',
  metadataBase: new URL(SITE_URL),
  openGraph: { type: 'website', url: SITE_URL, siteName: 'sgharlow' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const file = await loadEnrichedProjectsFile();
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${mono.variable} bg-zinc-950 text-white antialiased min-h-screen flex flex-col`}>
        <TopNav />
        <div className="flex-1">{children}</div>
        <FooterMonetizationBand entries={file.entries} />
      </body>
    </html>
  );
}
