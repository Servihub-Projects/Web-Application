'use client';

import { cn, initials, timeAgo } from '@/src/lib/utils';
import type { ConversationWithParticipants } from '@/src/lib/types';

interface ConversationListItemProps {
  conversation: ConversationWithParticipants;
  isActive: boolean;
  unread: number;
  onSelect: () => void;
}

export function ConversationListItem({
  conversation: conv,
  isActive,
  unread,
  onSelect,
}: ConversationListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 px-3 py-3.5 text-left transition-colors sm:px-4 sm:py-4',
        'min-h-[72px] active:bg-[var(--dash-bg)]',
        isActive ? 'md:bg-orange-50 md:dark:bg-orange-950/20' : 'hover:bg-[var(--dash-bg)]'
      )}
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-xs font-bold text-orange-600 dark:from-orange-950/50 dark:to-orange-900/50">
        {initials(conv.otherUser.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-[var(--dash-text)]">{conv.otherUser.name}</p>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <p className="whitespace-nowrap text-[10px] text-[var(--dash-text-muted)] opacity-80">
              {timeAgo(conv.lastMessageAt)}
            </p>
            {unread > 0 && (
              <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--dash-text-muted)]">
          {conv.lastMessage}
        </p>
      </div>
    </button>
  );
}
