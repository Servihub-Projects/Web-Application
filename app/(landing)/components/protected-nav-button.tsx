'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { useProtectedNavigate } from '@/src/lib/auth/protected-navigation';

type Props = {
  destination: string;
  fallback: string;
  className?: string;
  children: React.ReactNode;
};

export default function ProtectedNavButton({ destination, fallback, className, children }: Props) {
  const navigate = useProtectedNavigate();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      className={cn(className, busy && 'opacity-70 cursor-wait pointer-events-none')}
      onClick={async () => {
        setBusy(true);
        try {
          await navigate(destination, fallback);
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
    </button>
  );
}
