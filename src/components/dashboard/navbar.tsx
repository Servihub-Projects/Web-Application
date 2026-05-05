'use client';

import { Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme, useThemeSync } from '@/src/hooks/useTheme';
import { useCurrencySync } from '@/src/hooks/useCurrency';
import { useAuthStore } from '@/src/stores/auth-store';
import { cn, initials } from '@/src/lib/utils';
import type { Notification, SessionUser } from '@/src/lib/types';
import NotificationPanel from './notifications/notification-panel';

interface DashboardNavbarProps {
  user: SessionUser;
  notifications: Notification[];
}

export default function DashboardNavbar({ user, notifications }: DashboardNavbarProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useThemeSync();
  useCurrencySync(user.preferredCurrency);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex-shrink-0 bg-[var(--dash-card)] border-b border-[var(--dash-border)] flex items-center justify-end px-6 gap-2">
      {/* Theme toggle */}
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="p-2 rounded-lg text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] transition-colors"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      {/* Notifications */}
      <NotificationPanel notifications={notifications} />

      {/* User menu */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--dash-bg)] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-xs font-bold text-orange-600 `shrink-0">
            {initials(user.name)}
          </div>
          <span className="text-sm font-medium text-[var(--dash-text)] hidden sm:block">
            {user.name.split(' ')[0]}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'text-[var(--dash-text-muted)] transition-transform hidden sm:block',
              menuOpen && 'rotate-180'
            )}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-[var(--dash-card)] rounded-xl border border-[var(--dash-border)] shadow-lg py-1 z-50">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <p className="text-sm font-medium text-[var(--dash-text)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--dash-text-muted)] truncate mt-0.5">{user.email}</p>
              <span
                className={cn(
                  'inline-flex mt-2 text-xs font-medium px-2 py-0.5 rounded-full',
                  user.role === 'PROVIDER'
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/40'
                    : 'bg-green-50 text-green-700 dark:bg-green-950/40'
                )}
              >
                {user.role === 'PROVIDER' ? 'Provider' : 'Client'}
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                setMenuOpen(false);
                await logout();
                router.push('/');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
