'use client';

import { useRef, type KeyboardEvent, type RefObject } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { FilePreview } from './file-preview';

interface MessageComposerProps {
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  pendingFile: File | null;
  pendingPreviewUrl: string | null;
  onRemoveFile: () => void;
  onFileSelected: (files: FileList | null) => void;
  /** True while the latest outgoing attachment is uploading */
  isSending: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export function MessageComposer({
  draft,
  onDraftChange,
  onSend,
  onKeyDown,
  pendingFile,
  pendingPreviewUrl,
  onRemoveFile,
  onFileSelected,
  isSending,
  textareaRef,
}: MessageComposerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canSend = (draft.trim().length > 0 || !!pendingFile) && !isSending;

  return (
    <div className="flex-shrink-0 border-t border-[var(--dash-border)] bg-[var(--dash-card)] px-2 py-2 sm:px-3 sm:py-3 safe-area-pb">
      {pendingFile && (
        <div className="mb-2 px-1">
          <FilePreview
            file={pendingFile}
            previewUrl={pendingPreviewUrl}
            onRemove={onRemoveFile}
            disabled={isSending}
          />
        </div>
      )}

      <div className="flex min-h-[48px] items-end gap-1.5 sm:gap-2">
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          aria-label="Attach file"
          onChange={(e) => {
            onFileSelected(e.target.files);
            e.target.value = '';
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isSending}
          className={cn(
            'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
            'text-[var(--dash-text-muted)] transition-colors',
            'hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text)]',
            'active:scale-95 disabled:opacity-40'
          )}
          aria-label="Attach file"
        >
          <Paperclip size={22} strokeWidth={2} />
        </button>

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message"
          rows={1}
          disabled={isSending}
          className={cn(
            'app-scrollbar input-field max-h-[120px] min-h-[44px] flex-1 resize-none py-3 text-[15px] leading-snug',
            'placeholder:text-[var(--dash-text-muted)]'
          )}
        />

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className={cn(
            'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
            'bg-orange-500 text-white shadow-sm transition-all',
            'hover:bg-orange-600 active:scale-95',
            'disabled:cursor-not-allowed disabled:opacity-40'
          )}
          aria-label="Send message"
        >
          <Send size={18} className={cn(isSending && 'opacity-70')} />
        </button>
      </div>
    </div>
  );
}
