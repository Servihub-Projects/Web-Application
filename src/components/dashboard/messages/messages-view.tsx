'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { cn, initials, timeAgo } from '@/src/lib/utils';
import type { ConversationWithParticipants, Message } from '@/src/lib/types';

interface MessagesViewProps {
  conversations: ConversationWithParticipants[];
  currentUserId: string;
}

export default function MessagesView({ conversations, currentUserId }: MessagesViewProps) {
  const [activeId, setActiveId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [threads, setThreads] = useState<Record<string, Message[]>>(
    Object.fromEntries(conversations.map((c) => [c.id, c.messages]))
  );
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeId ? (threads[activeId] ?? []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeId]);

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
      <div className="card flex flex-col items-center justify-center h-96 gap-3">
        <MessageSquare size={32} className="text-[var(--dash-text-muted)] opacity-40" />
        <p className="text-sm font-medium text-[var(--dash-text)]">No conversations yet</p>
        <p className="text-xs text-[var(--dash-text-muted)]">
          Start a conversation by contacting a provider or replying to a job request.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden flex h-[calc(100vh-10rem)] min-h-[500px]">
      {/* Conversation list */}
      <aside className="w-72 flex-shrink-0 border-r border-[var(--dash-border)] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--dash-border)]">
          <p className="text-sm font-semibold text-[var(--dash-text)]">Messages</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--dash-border)]">
          {conversations.map((conv) => {
            const unread = conv.unreadCount[currentUserId] ?? 0;
            const isActive = conv.id === activeId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-950/20'
                    : 'hover:bg-[var(--dash-bg)]'
                )}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950/50 dark:to-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                  {initials(conv.otherUser.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-[var(--dash-text)] truncate">
                      {conv.otherUser.name}
                    </p>
                    {unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--dash-text-muted)] truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                  <p className="text-[10px] text-[var(--dash-text-muted)] mt-0.5 opacity-70">
                    {timeAgo(conv.lastMessageAt)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Thread panel */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Thread header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--dash-border)] flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950/50 dark:to-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-600">
              {initials(active.otherUser.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--dash-text)]">{active.otherUser.name}</p>
              <p className="text-xs text-[var(--dash-text-muted)] capitalize">
                {active.otherUser.role.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[72%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                      isMine
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-[var(--dash-bg)] text-[var(--dash-text)] rounded-bl-sm'
                    )}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={cn(
                        'text-[10px] mt-1',
                        isMine ? 'text-orange-200' : 'text-[var(--dash-text-muted)]'
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

          {/* Compose */}
          <div className="px-5 py-3 border-t border-[var(--dash-border)] flex items-end gap-2 flex-shrink-0">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="input-field flex-1 resize-none leading-relaxed py-2.5 max-h-28 overflow-y-auto"
            />
            <button
              onClick={sendMessage}
              disabled={!draft.trim()}
              className="p-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[var(--dash-text-muted)]">
          <p className="text-sm">Select a conversation</p>
        </div>
      )}
    </div>
  );
}
