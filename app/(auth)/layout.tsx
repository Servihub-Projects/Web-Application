import Image from 'next/image';
import Link from 'next/link';
import { Toaster } from 'sonner';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--dash-bg)] flex flex-col">
      <nav className="border-b border-[var(--dash-border)] bg-white px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="ServiHub" width={32} height={32} />
          <span className="font-semibold text-gray-900 text-sm">ServiHub</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
}
