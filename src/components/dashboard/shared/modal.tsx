'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Accessible modal shell shared across the dashboard. Locks body scroll while
 * open, closes on Escape, and traps clicks on the backdrop.
 */
export default function Modal({ title, description, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-xl">
        <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-[var(--dash-border)] px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[var(--dash-text)]">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--dash-text-muted)]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex-shrink-0 rounded-lg p-1.5 text-[var(--dash-text-muted)] transition-colors hover:bg-[var(--dash-bg)]"
          >
            <X size={15} />
          </button>
        </div>
        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
      </div>
    </div>
  );
}
