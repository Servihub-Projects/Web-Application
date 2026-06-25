'use client';

import type { RefObject } from 'react';
import type { Message } from '@/src/lib/types';
import { MessageBubble } from './message-bubble';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  bottomRef: RefObject<HTMLDivElement | null>;
  onRetryUpload?: (message: Message) => void;
}

export function MessageThread({
  messages,
  currentUserId,
  bottomRef,
  onRetryUpload,
}: MessageThreadProps) {
  return (
    <div
      className="app-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--dash-bg) 92%, transparent) 0%, var(--dash-card) 100%)',
      }}
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isMine={msg.senderId === currentUserId}
          onRetryUpload={onRetryUpload}
        />
      ))}
      <div ref={bottomRef} className="h-px w-full flex-shrink-0" aria-hidden />
    </div>
  );
}
