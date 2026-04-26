'use client';

import { useState } from 'react';
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

interface NotificationsViewProps {
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

export default function NotificationsView({ notifications: initial }: NotificationsViewProps) {
  const [items, setItems] = useState(initial);

  const unread = items.filter((n) => !n.isRead).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-20 gap-3">
        <Bell size={32} className="text-[var(--dash-text-muted)] opacity-30" />
        <p className="text-sm font-medium text-[var(--dash-text)]">No notifications</p>
        <p className="text-xs text-[var(--dash-text-muted)]">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <div className="flex justify-end">
          <button
            onClick={markAllRead}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}

      <div className="card divide-y divide-[var(--dash-border)] overflow-hidden">
        {items.map((notif) => {
          const { icon: Icon, color } = typeConfig[notif.type];
          return (
            <div
              key={notif.id}
              className={cn(
                'group flex items-start gap-4 px-5 py-4 transition-colors relative',
                !notif.isRead
                  ? 'bg-orange-50/50 dark:bg-orange-950/10'
                  : 'hover:bg-[var(--dash-bg)]'
              )}
            >
              {/* Unread dot */}
              {!notif.isRead && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              )}

              {/* Icon */}
              <div className={cn('p-2.5 rounded-xl flex-shrink-0 mt-0.5', color)}>
                <Icon size={15} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {notif.actionUrl ? (
                  <Link
                    href={notif.actionUrl}
                    onClick={() => markRead(notif.id)}
                    className="block group/link"
                  >
                    <p className="text-sm font-semibold text-[var(--dash-text)] leading-snug group-hover/link:text-orange-500 transition-colors">
                      {notif.title}
                    </p>
                    <p className="text-sm text-[var(--dash-text-muted)] mt-0.5 leading-relaxed">
                      {notif.body}
                    </p>
                  </Link>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[var(--dash-text)] leading-snug">
                      {notif.title}
                    </p>
                    <p className="text-sm text-[var(--dash-text-muted)] mt-0.5 leading-relaxed">
                      {notif.body}
                    </p>
                  </>
                )}
                <p className="text-xs text-[var(--dash-text-muted)] mt-1.5 opacity-70">
                  {timeAgo(notif.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.isRead && (
                  <button
                    onClick={() => markRead(notif.id)}
                    className="p-1.5 rounded-md text-[var(--dash-text-muted)] hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => dismiss(notif.id)}
                  className="p-1.5 rounded-md text-[var(--dash-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
