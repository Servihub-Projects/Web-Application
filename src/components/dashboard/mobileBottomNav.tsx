'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MoreHorizontal, X, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MobileNavProps {
  links: {
    label: string;
    href: string;
    icon: LucideIcon;
    exact: boolean;
  }[];
  user: {
    name: string;
    email: string;
  };
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

export default function MobileBottomNav({ links, user }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const MAX_VISIBLE = 4;
  const visibleLinks = links.slice(0, MAX_VISIBLE);
  const overflowLinks = links.slice(MAX_VISIBLE);

  // ESC close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      {/* Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-[var(--dash-sidebar)] border-[var(--dash-sidebar-border)]">
        <div className="flex items-center justify-around h-16">
          {visibleLinks.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center text-xs',
                  active ? 'text-orange-600' : 'text-[var(--dash-text-muted)]'
                )}
              >
                <Icon size={20} />
                <span className="mt-1">{label}</span>
              </Link>
            );
          })}

          {overflowLinks.length > 0 && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex flex-col items-center justify-center text-xs text-[var(--dash-text-muted)]"
            >
              <MoreHorizontal size={20} />
              <span className="mt-1">More</span>
            </button>
          )}
        </div>
      </div>

      {/* Drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 flex max-h-[min(85vh,28rem)] flex-col overflow-hidden rounded-t-2xl border border-[var(--dash-border)] border-b-0 bg-[var(--dash-card)] shadow-lg dark:border-[var(--dash-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--dash-border)] px-4 py-3">
              <h3 className="text-sm font-semibold text-[var(--dash-text)]">More</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-2">
              <div className="mb-4 flex flex-col gap-1">
                {overflowLinks.map(({ label, href, icon: Icon, exact }) => {
                  const active = isActive(href, exact);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                          : 'text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]'
                      )}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  'mb-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  pathname.startsWith('/dashboard/settings')
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                    : 'text-[var(--dash-text-muted)]'
                )}
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>

              <div className="flex items-center gap-3 border-t border-[var(--dash-sidebar-border)] pt-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 dark:bg-orange-950/40">
                  {initials(user.name)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--dash-text)]">{user.name}</p>
                  <p className="truncate text-xs text-[var(--dash-text-muted)]">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
