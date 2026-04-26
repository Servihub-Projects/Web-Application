'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  MessageSquare,
  Star,
  DollarSign,
  XCircle,
  Info,
  X,
} from 'lucide-react';
import { cn, timeAgo } from '@/src/lib/utils';
import type { Notification, NotificationType } from '@/src/lib/types';

interface NotificationPanelProps {
  notifications: Notification[];
}

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  BOOKING_REQUEST:  { icon: BriefcaseBusiness, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
  BOOKING_ACCEPTED: { icon: CheckCircle2,      color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
  BOOKING_DECLINED: { icon: XCircle,           color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
  PAYMENT_RECEIVED: { icon: DollarSign,        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  PAYMENT_RELEASED: { icon: DollarSign,        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  NEW_MESSAGE:      { icon: MessageSquare,     color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
  JOB_REVIEW:       { icon: Star,              color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  SYSTEM:           { icon: Info,              color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' },
};

export default function NotificationPanel({ notifications }: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        className="relative p-2 rounded-lg text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)] transition-colors"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-[var(--dash-card)] rounded-xl border border-[var(--dash-border)] shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--dash-border)]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--dash-text)]">Notifications</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-50 text-orange-600 dark:bg-orange-950/30 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-[var(--dash-border)]">
            {items.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="mx-auto text-[var(--dash-text-muted)] mb-2 opacity-40" />
                <p className="text-sm text-[var(--dash-text-muted)]">All caught up!</p>
              </div>
            ) : (
              items.map((notif) => {
                const { icon: Icon, color } = typeConfig[notif.type];
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 transition-colors relative',
                      !notif.isRead
                        ? 'bg-orange-50/50 dark:bg-orange-950/10'
                        : 'hover:bg-[var(--dash-bg)]'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg flex-shrink-0 mt-0.5', color)}>
                      <Icon size={13} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {notif.actionUrl ? (
                        <Link
                          href={notif.actionUrl}
                          onClick={() => {
                            setItems((prev) =>
                              prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n)
                            );
                            setOpen(false);
                          }}
                          className="block"
                        >
                          <p className="text-sm font-medium text-[var(--dash-text)] leading-snug">
                            {notif.title}
                          </p>
                          <p className="text-xs text-[var(--dash-text-muted)] mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.body}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-[var(--dash-text)] leading-snug">
                            {notif.title}
                          </p>
                          <p className="text-xs text-[var(--dash-text-muted)] mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.body}
                          </p>
                        </>
                      )}
                      <p className="text-[10px] text-[var(--dash-text-muted)] mt-1 opacity-70">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>

                    <button
                      onClick={() => dismiss(notif.id)}
                      className="flex-shrink-0 p-0.5 rounded text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Dismiss"
                    >
                      <X size={12} />
                    </button>

                    {!notif.isRead && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-[var(--dash-border)] px-4 py-2.5">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
