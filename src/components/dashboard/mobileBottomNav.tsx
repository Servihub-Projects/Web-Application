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
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0',
              'bg-[var(--dash-card)] rounded-t-3xl',
              'px-4 pt-3 pb-8',
              'shadow-2xl border-t border-[var(--dash-sidebar-border)]'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1.5 rounded-full bg-[var(--dash-border)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-[var(--dash-text)]">
                  More
                </h3>
                <p className="text-xs text-[var(--dash-text-muted)]">
                  Additional navigation and account options
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className={cn(
                  'w-9 h-9 rounded-full',
                  'flex items-center justify-center',
                  'bg-[var(--dash-bg)] hover:bg-[var(--dash-border)]',
                  'transition-colors'
                )}
              >
                <X size={18} />
              </button>
            </div>

            {/* Vertical links */}
            <div className="space-y-1 mb-5">
              {overflowLinks.map(({ label, href, icon: Icon, exact }) => {
                const active = isActive(href, exact);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-4',
                      'px-4 py-3 rounded-2xl',
                      'transition-colors',
                      active
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                        : 'text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        active
                          ? 'bg-orange-100 dark:bg-orange-900/30'
                          : 'bg-[var(--dash-bg)]'
                      )}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Settings */}
            <div className="mb-5">
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-4',
                  'px-4 py-3 rounded-2xl transition-colors',
                  pathname.startsWith('/dashboard/settings')
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                    : 'text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    pathname.startsWith('/dashboard/settings')
                      ? 'bg-orange-100 dark:bg-orange-900/30'
                      : 'bg-[var(--dash-bg)]'
                  )}
                >
                  <Settings size={18} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">Settings</p>
                </div>
              </Link>
            </div>

            {/* User */}
            <div className="border-t border-[var(--dash-sidebar-border)] pt-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
                  {initials(user.name)}
                </div>

                <div className="flex-1 min-w-0">
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
        </div>
      )}
    </>
  );
}
