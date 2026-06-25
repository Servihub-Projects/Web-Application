'use client';

import type { KeyboardEvent, RefObject } from 'react';
import { MessageSquare } from 'lucide-react';
import type { ConversationWithParticipants, Message } from '@/src/lib/types';
import { ChatHeader } from './chat-header';
import { MessageThread } from './message-thread';
import { MessageComposer } from './message-composer';

interface ChatPanelProps {
  active: ConversationWithParticipants | null;
  messages: Message[];
  currentUserId: string;
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onBack: () => void;
  pendingFile: File | null;
  pendingPreviewUrl: string | null;
  onRemoveFile: () => void;
  onFileSelected: (files: FileList | null) => void;
  isSending: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onRetryUpload?: (message: Message) => void;
  className?: string;
}

export function ChatPanel({
  active,
  messages,
  currentUserId,
  draft,
  onDraftChange,
  onSend,
  onKeyDown,
  onBack,
  pendingFile,
  pendingPreviewUrl,
  onRemoveFile,
  onFileSelected,
  isSending,
  bottomRef,
  textareaRef,
  onRetryUpload,
  className,
}: ChatPanelProps) {
  return (
    <div className={className}>
      {active ? (
        <>
          <ChatHeader active={active} onBack={onBack} />
          <MessageThread
            messages={messages}
            currentUserId={currentUserId}
            bottomRef={bottomRef}
            onRetryUpload={onRetryUpload}
          />
          <MessageComposer
            draft={draft}
            onDraftChange={onDraftChange}
            onSend={onSend}
            onKeyDown={onKeyDown}
            pendingFile={pendingFile}
            pendingPreviewUrl={pendingPreviewUrl}
            onRemoveFile={onRemoveFile}
            onFileSelected={onFileSelected}
            isSending={isSending}
            textareaRef={textareaRef}
          />
        </>
      ) : (
        <div className="hidden min-h-[200px] flex-1 flex-col items-center justify-center gap-2 px-6 text-center md:flex">
          <MessageSquare size={28} className="text-[var(--dash-text-muted)] opacity-25" />
          <p className="text-sm text-[var(--dash-text-muted)]">Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
}
