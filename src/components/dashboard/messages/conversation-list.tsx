'use client';

import type { ConversationWithParticipants } from '@/src/lib/types';
import { ConversationListItem } from './conversation-list-item';

interface ConversationListProps {
  conversations: ConversationWithParticipants[];
  activeId: string | null;
  currentUserId: string;
  onSelect: (id: string) => void;
  /** When true, list panel is off-screen (mobile chat open). Still mounted for smooth transition. */
  className?: string;
}

export function ConversationList({
  conversations,
  activeId,
  currentUserId,
  onSelect,
  className,
}: ConversationListProps) {
  return (
    <aside className={className}>
      <div className="flex h-14 flex-shrink-0 items-center border-b border-[var(--dash-border)] px-4">
        <p className="text-sm font-semibold text-[var(--dash-text)]">Messages</p>
      </div>

      <div className="app-scrollbar min-h-0 flex-1 divide-y divide-[var(--dash-border)] overflow-y-auto overscroll-contain">
        {conversations.map((conv) => {
          const unread = conv.unreadCount[currentUserId] ?? 0;
          const isActive = conv.id === activeId;
          return (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isActive={isActive}
              unread={unread}
              onSelect={() => onSelect(conv.id)}
            />
          );
        })}
      </div>
    </aside>
  );
}
