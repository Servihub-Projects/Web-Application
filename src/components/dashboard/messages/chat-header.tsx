'use client';

import { ChevronLeft } from 'lucide-react';
import { cn, initials } from '@/src/lib/utils';
import type { ConversationWithParticipants } from '@/src/lib/types';

interface ChatHeaderProps {
  active: ConversationWithParticipants;
  onBack: () => void;
}

export function ChatHeader({ active, onBack }: ChatHeaderProps) {
  return (
    <div className="flex min-h-[52px] items-center gap-2 border-b border-[var(--dash-border)] px-2 py-2 sm:min-h-14 sm:gap-3 sm:px-4 sm:py-3">
      <button
        type="button"
        onClick={onBack}
        className={cn(
          'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
          'text-[var(--dash-text)] transition-colors md:hidden',
          'hover:bg-[var(--dash-bg)] active:scale-95'
        )}
        aria-label="Back to conversations"
      >
        <ChevronLeft size={22} strokeWidth={2.25} />
      </button>

      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-xs font-bold text-orange-600 dark:from-orange-950/50 dark:to-orange-900/50">
        {initials(active.otherUser.name)}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <p className="truncate text-sm font-semibold text-[var(--dash-text)] sm:text-base">
          {active.otherUser.name}
        </p>
        <p className="truncate text-xs capitalize leading-tight text-[var(--dash-text-muted)]">
          {active.otherUser.role.toLowerCase()}
        </p>
      </div>
    </div>
  );
}
