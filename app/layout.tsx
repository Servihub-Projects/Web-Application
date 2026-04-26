import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ServiHub – Connect with Trusted Service Providers',
    template: '%s | ServiHub',
  },
  description:
    'ServiHub is a marketplace that connects clients with top-rated service providers. Find reliable professionals or offer your skills today.',
  keywords: ['ServiHub', 'service marketplace', 'hire professionals', 'find work'],
  metadataBase: new URL('https://servihub.com'),
  openGraph: {
    siteName: 'ServiHub',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
