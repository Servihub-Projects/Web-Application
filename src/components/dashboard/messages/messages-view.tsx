'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ChevronLeft } from 'lucide-react';
import { cn, initials, timeAgo } from '@/src/lib/utils';
import type { ConversationWithParticipants, Message } from '@/src/lib/types';

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
  // Controls which panel is visible on mobile ('list' | 'chat')
  const [mobilePanel, setMobilePanel] = useState<'list' | 'chat'>('list');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeId ? (threads[activeId] ?? []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeId]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [draft]);

  function selectConversation(id: string) {
    setActiveId(id);
    setMobilePanel('chat');
    setDraft('');
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text || !activeId || !active) return;

    const msg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: activeId,
      senderId: currentUserId,
      receiverId: active.otherUser.id,
      content: text,
      type: 'TEXT',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setThreads((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), msg],
    }));
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center h-96 gap-3 text-center px-6">
        <MessageSquare size={32} className="text-[var(--dash-text-muted)] opacity-40" />
        <p className="text-sm font-medium text-[var(--dash-text)]">No conversations yet</p>
        <p className="text-xs text-[var(--dash-text-muted)]">
          Start a conversation by contacting a provider or replying to a job request.
        </p>
      </div>
    );
  }

  return (
    /*
     * Outer shell: clips the sliding panels on mobile, behaves as a
     * normal flex row on md+. Height fills the remaining viewport.
     */
    <div className="card overflow-hidden relative flex h-[calc(100vh-11rem)] min-h-[420px]">

      {/* ── Conversation list ──────────────────────────────────────────── */}
      <aside
        className={cn(
          // Shared
          'flex flex-col bg-[var(--dash-card)] transition-transform duration-300 ease-in-out',
          // Mobile: fills the whole container; slides left when chat is open
          'absolute inset-0 z-10',
          mobilePanel === 'chat' ? '-translate-x-full' : 'translate-x-0',
          // Desktop: static sidebar, always visible, no transform
          'md:relative md:inset-auto md:z-auto md:translate-x-0',
          'md:w-72 md:flex-shrink-0 md:border-r md:border-[var(--dash-border)]'
        )}
      >
        <div className="px-4 py-3.5 border-b border-[var(--dash-border)] flex-shrink-0">
          <p className="text-sm font-semibold text-[var(--dash-text)]">Messages</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[var(--dash-border)]">
          {conversations.map((conv) => {
            const unread = conv.unreadCount[currentUserId] ?? 0;
            const isActive = conv.id === activeId;

            return (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors',
                  // Highlight selected on desktop only (on mobile the panel hides)
                  isActive
                    ? 'md:bg-orange-50 md:dark:bg-orange-950/20'
                    : 'hover:bg-[var(--dash-bg)]'
                )}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950/50 dark:to-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                  {initials(conv.otherUser.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--dash-text)] truncate">
                      {conv.otherUser.name}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <p className="text-[10px] text-[var(--dash-text-muted)] opacity-70 whitespace-nowrap">
                        {timeAgo(conv.lastMessageAt)}
                      </p>
                      {unread > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--dash-text-muted)] truncate mt-0.5 leading-relaxed">
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Chat panel ────────────────────────────────────────────────── */}
      <div
        className={cn(
          // Shared
          'flex flex-col bg-[var(--dash-card)] transition-transform duration-300 ease-in-out',
          // Mobile: fills the whole container; slides in from the right
          'absolute inset-0 z-20',
          mobilePanel === 'chat' ? 'translate-x-0' : 'translate-x-full',
          // Desktop: static flex panel, always visible, no transform
          'md:relative md:inset-auto md:z-auto md:translate-x-0 md:flex-1 md:min-w-0'
        )}
      >
        {active ? (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--dash-border)] flex-shrink-0">
              {/* Back arrow — mobile only */}
              <button
                onClick={() => setMobilePanel('list')}
                className="md:hidden -ml-1 p-1.5 rounded-lg hover:bg-[var(--dash-bg)] transition-colors flex-shrink-0"
                aria-label="Back to conversations"
              >
                <ChevronLeft size={20} className="text-[var(--dash-text)]" />
              </button>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950/50 dark:to-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                {initials(active.otherUser.name)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--dash-text)] truncate">
                  {active.otherUser.name}
                </p>
                <p className="text-xs text-[var(--dash-text-muted)] capitalize leading-tight">
                  {active.otherUser.role.toLowerCase()}
                </p>
              </div>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] sm:max-w-[72%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                        isMine
                          ? 'bg-orange-500 text-white rounded-br-sm'
                          : 'bg-[var(--dash-bg)] text-[var(--dash-text)] rounded-bl-sm'
                      )}
                    >
                      <p className="break-words">{msg.content}</p>
                      <p
                        className={cn(
                          'text-[10px] mt-1 select-none',
                          isMine ? 'text-orange-200 text-right' : 'text-[var(--dash-text-muted)]'
                        )}
                      >
                        {timeAgo(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Compose bar */}
            <div className="px-4 py-3 border-t border-[var(--dash-border)] flex items-end gap-2 flex-shrink-0">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                className="input-field flex-1 resize-none leading-relaxed py-2.5 overflow-y-auto"
                style={{ maxHeight: '112px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </>
        ) : (
          /* Desktop empty state — not reachable on mobile (panels slide before this renders) */
          <div className="flex-1 hidden md:flex flex-col items-center justify-center gap-2 text-[var(--dash-text-muted)]">
            <MessageSquare size={28} className="opacity-25" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
