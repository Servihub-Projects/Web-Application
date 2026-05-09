'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { ConversationWithParticipants, Message } from '@/src/lib/types';
import { uploadMessageFile } from '@/src/lib/messages/upload-message-file';
import { MESSAGE_MAX_FILE_BYTES } from '@/src/lib/messages/simulate-upload';
import { ConversationList } from './conversation-list';
import { ChatPanel } from './chat-panel';

interface MessagesViewProps {
  conversations: ConversationWithParticipants[];
  currentUserId: string;
}

export default function MessagesView({ conversations, currentUserId }: MessagesViewProps) {
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null);
  const [threads, setThreads] = useState<Record<string, Message[]>>(
    Object.fromEntries(conversations.map((c) => [c.id, c.messages]))
  );
  const [draft, setDraft] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'list' | 'chat'>('list');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeId ? (threads[activeId] ?? []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeId]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  const removePendingFile = useCallback(() => {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(null);
    setPendingPreviewUrl(null);
    setComposerError(null);
  }, [pendingPreviewUrl]);

  const clearPendingStateOnly = useCallback(() => {
    setPendingFile(null);
    setPendingPreviewUrl(null);
    setComposerError(null);
  }, []);

  const onFileSelected = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      setComposerError(null);
      if (file.size > MESSAGE_MAX_FILE_BYTES) {
        setComposerError(`File is too large (max ${Math.round(MESSAGE_MAX_FILE_BYTES / (1024 * 1024))} MB).`);
        return;
      }
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
      setPendingFile(file);
      if (file.type.startsWith('image/')) {
        setPendingPreviewUrl(URL.createObjectURL(file));
      } else {
        setPendingPreviewUrl(null);
      }
    },
    [pendingPreviewUrl]
  );

  const uploadAttachmentForMessage = useCallback(
    async (conversationId: string, messageId: string, file: File) => {
      setUploadBusy(true);
      try {
        const { id, url } = await uploadMessageFile(file);
        setThreads((prev) => {
          const list = prev[conversationId] ?? [];
          return {
            ...prev,
            [conversationId]: list.map((m) => {
              if (m.id !== messageId) return m;
              const oldUrl = m.attachment?.url;
              const base = m.attachment ?? {
                id,
                name: file.name,
                mimeType: file.type || 'application/octet-stream',
                size: file.size,
                url,
              };
              const next = { ...base, id, url };
              if (oldUrl && oldUrl.startsWith('blob:') && oldUrl !== url) {
                URL.revokeObjectURL(oldUrl);
              }
              return {
                ...m,
                attachment: next,
                uploadStatus: 'success' as const,
                localFile: undefined,
              };
            }),
          };
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Upload failed';
        setThreads((prev) => {
          const list = prev[conversationId] ?? [];
          return {
            ...prev,
            [conversationId]: list.map((m) =>
              m.id === messageId
                ? { ...m, uploadStatus: 'error' as const, uploadError: message }
                : m
            ),
          };
        });
      } finally {
        setUploadBusy(false);
      }
    },
    []
  );

  function selectConversation(id: string) {
    setActiveId(id);
    setMobilePanel('chat');
    setDraft('');
    setComposerError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function sendMessage() {
    const text = draft.trim();
    const file = pendingFile;
    if ((!text && !file) || !activeId || !active || uploadBusy) return;

    let attachmentUrl = '';
    if (file) {
      attachmentUrl =
        file.type.startsWith('image/') && pendingPreviewUrl
          ? pendingPreviewUrl
          : URL.createObjectURL(file);
    }

    const msg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: activeId,
      senderId: currentUserId,
      receiverId: active.otherUser.id,
      content: text,
      type: file ? (file.type.startsWith('image/') ? 'IMAGE' : 'FILE') : 'TEXT',
      isRead: false,
      createdAt: new Date().toISOString(),
      attachment: file
        ? {
            id: `local_${Date.now()}`,
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            url: attachmentUrl,
          }
        : undefined,
      uploadStatus: file ? 'uploading' : undefined,
      localFile: file ?? undefined,
    };

    setThreads((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), msg],
    }));
    setDraft('');
    clearPendingStateOnly();

    if (file) {
      void uploadAttachmentForMessage(activeId, msg.id, file);
    }
  }

  const onRetryUpload = useCallback(
    (message: Message) => {
      if (!message.localFile || !message.conversationId) return;
      setThreads((prev) => {
        const list = prev[message.conversationId] ?? [];
        return {
          ...prev,
          [message.conversationId]: list.map((m) =>
            m.id === message.id
              ? { ...m, uploadStatus: 'uploading' as const, uploadError: undefined }
              : m
          ),
        };
      });
      void uploadAttachmentForMessage(message.conversationId, message.id, message.localFile);
    },
    [uploadAttachmentForMessage]
  );

  if (conversations.length === 0) {
    return (
      <div className="card flex min-h-[min(100dvh,28rem)] flex-col items-center justify-center gap-3 px-6 py-12 text-center md:min-h-96">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--dash-bg)]">
          <MessageSquare size={28} className="text-[var(--dash-text-muted)] opacity-50" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-[var(--dash-text)]">No conversations yet</p>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--dash-text-muted)]">
            When you contact a provider or reply to a job request, your chats will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'card relative flex min-h-[min(420px,calc(100dvh-12rem))] flex-col overflow-hidden',
        'md:min-h-[min(560px,calc(100dvh-13rem))]',
        'shadow-sm'
      )}
    >
      {composerError && (
        <div
          className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          {composerError}
        </div>
      )}

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          currentUserId={currentUserId}
          onSelect={selectConversation}
          className={cn(
            'flex min-h-0 min-w-0 flex-col bg-[var(--dash-card)] transition-[transform,opacity] duration-300 ease-out',
            'absolute inset-0 z-10 md:relative md:inset-auto md:z-auto md:flex-shrink-0',
            'w-full max-w-full md:w-72',
            mobilePanel === 'chat'
              ? '-translate-x-[calc(100%+1px)] opacity-0 max-md:pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto'
              : 'translate-x-0 opacity-100'
          )}
        />

        <ChatPanel
          active={active}
          messages={messages}
          currentUserId={currentUserId}
          draft={draft}
          onDraftChange={setDraft}
          onSend={sendMessage}
          onKeyDown={handleKeyDown}
          onBack={() => setMobilePanel('list')}
          pendingFile={pendingFile}
          pendingPreviewUrl={pendingPreviewUrl}
          onRemoveFile={removePendingFile}
          onFileSelected={onFileSelected}
          isSending={uploadBusy}
          bottomRef={bottomRef}
          textareaRef={textareaRef}
          onRetryUpload={onRetryUpload}
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--dash-card)] transition-[transform,opacity] duration-300 ease-out',
            'absolute inset-0 z-20 md:relative md:inset-auto md:z-auto',
            mobilePanel === 'chat'
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0 max-md:pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto'
          )}
        />
      </div>
    </div>
  );
}
