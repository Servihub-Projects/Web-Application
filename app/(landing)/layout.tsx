import type { Metadata } from 'next';
import NavigationBar from './components/navbar';
import { Footer } from './components/footer';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'ServiHub – Connect with Trusted Service Providers',
  description:
    'ServiHub is a platform that links service providers with people who need their services. Find reliable professionals or offer your skills today.',
  openGraph: {
    title: 'ServiHub – Connect with Trusted Service Providers',
    description:
      'Discover, hire, and offer services all in one place. ServiHub connects service providers with those who need them.',
    url: 'https://servihub.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ServiHub platform preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServiHub – Connect with Trusted Service Providers',
    images: ['/og-image.png'],
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-hidden">
      <NavigationBar />
      {children}
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}
