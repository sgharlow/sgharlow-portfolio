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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <div className="max-w-6xl mx-auto px-6 py-5">
          <TopNav />
          {children}
        </div>
      </body>
    </html>
  );
}
