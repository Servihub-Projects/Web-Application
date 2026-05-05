'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  BookOpen,
  BarChart2,
  MessageSquare,
  Bell,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { cn, initials } from '@/src/lib/utils';
import type { SessionUser } from '@/src/lib/types';
import MobileBottomNav from './mobileBottomNav';

interface SidebarProps {
  user: SessionUser;
}

const clientLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Discover', href: '/dashboard/discover', icon: Search, exact: false },
  { label: 'My Hires', href: '/dashboard/my-hires', icon: Briefcase, exact: false },
  { label: 'My Jobs', href: '/dashboard/jobs', icon: ClipboardList, exact: false },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare, exact: false },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell, exact: false },
];

const providerLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Bookings', href: '/dashboard/bookings', icon: BookOpen, exact: false },
  { label: 'Find Clients', href: '/dashboard/find-clients', icon: Users, exact: false },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2, exact: false },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare, exact: false },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell, exact: false },
];

export default function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const links = user.role === 'CLIENT' ? clientLinks : providerLinks;

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <aside
        className={cn(
          'relative hidden lg:flex flex-col flex-shrink-0 transition-[width] duration-300 ease-in-out',
          'bg-[var(--dash-sidebar)] border-r border-[var(--dash-sidebar-border)]',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-[var(--dash-sidebar-border)] overflow-hidden">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <Image src="/logo.png" alt="ServiHub" width={28} height={28} className="flex-shrink-0" />
            {!collapsed && (
              <span className="font-semibold text-[var(--dash-text)] text-sm truncate">
                ServiHub
              </span>
            )}
          </Link>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-[var(--dash-sidebar-border)]">
            <span
              className={cn(
                'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full',
                user.role === 'PROVIDER'
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-green-50 text-green-700'
              )}
            >
              {user.role === 'PROVIDER' ? 'Provider' : 'Client'}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {links.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                  active
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                    : 'text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-2 pb-2">
          <Link
            href="/dashboard/settings"
            title={collapsed ? 'Settings' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
              pathname.startsWith('/dashboard/settings')
                ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                : 'text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]',
              collapsed && 'justify-center px-2'
            )}
          >
            <Settings size={18} className="flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>

        {/* User */}
        <div
          className={cn(
            'border-t border-[var(--dash-sidebar-border)] p-4',
            collapsed && 'flex justify-center p-3'
          )}
        >
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-xs font-bold text-orange-600">
              {initials(user.name)}
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                {initials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--dash-text)] truncate">{user.name}</p>
                <p className="text-xs text-[var(--dash-text-muted)] truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'absolute -right-3 top-[72px] z-10',
            'w-6 h-6 rounded-full bg-[var(--dash-card)] border border-[var(--dash-border)]',
            'flex items-center justify-center shadow-sm hover:shadow-md transition-shadow',
            'text-[var(--dash-text-muted)]'
          )}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
      {/* Mobile Bottom Nav */}
      <MobileBottomNav links={links} user={user} />
    </>

  );
}
