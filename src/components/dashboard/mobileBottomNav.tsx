'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MoreHorizontal, X, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MobileNavProps {
  links: {
    label: string;
    href: string;
    icon: any;
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
            className="absolute bottom-0 left-0 right-0 bg-[var(--dash-card)] rounded-t-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">More</h3>
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Grid links */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {overflowLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center text-xs text-[var(--dash-text-muted)]"
                >
                  <Icon size={20} />
                  <span className="mt-1 text-center">{label}</span>
                </Link>
              ))}
            </div>

            {/* Settings */}
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-4',
                pathname.startsWith('/dashboard/settings')
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                  : 'text-[var(--dash-text-muted)]'
              )}
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>

            {/* User card */}
            <div className="border-t border-[var(--dash-sidebar-border)] pt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-xs font-bold text-orange-600">
                {initials(user.name)}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--dash-text)] truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[var(--dash-text-muted)] truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
