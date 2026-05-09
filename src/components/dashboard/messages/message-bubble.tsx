'use client';

import { AlertCircle, Check, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { cn, formatFileSize, timeAgo } from '@/src/lib/utils';
import type { Message } from '@/src/lib/types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  onRetryUpload?: (message: Message) => void;
}

export function MessageBubble({ message, isMine, onRetryUpload }: MessageBubbleProps) {
  const att = message.attachment;
  const isImage = !!att?.mimeType?.startsWith('image/');
  const uploading = message.uploadStatus === 'uploading';
  const failed = message.uploadStatus === 'error';

  return (
    <div className={cn('flex w-full', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[min(100%,20rem)] sm:max-w-[min(100%,24rem)]',
          'space-y-1.5'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
            isMine
              ? 'rounded-br-md bg-orange-500 text-white'
              : 'rounded-bl-md bg-[var(--dash-bg)] text-[var(--dash-text)] ring-1 ring-[var(--dash-border)]'
          )}
        >
          {att && (
            <div className={cn('mb-2', !message.content && 'mb-0')}>
              {isImage && att.url ? (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt={att.name}
                    className="max-h-48 w-full object-cover"
                  />
                </a>
              ) : (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm',
                    isMine ? 'bg-orange-600/30 text-white' : 'bg-[var(--dash-card)]'
                  )}
                >
                  {isImage ? (
                    <ImageIcon className="h-4 w-4 flex-shrink-0 opacity-80" />
                  ) : (
                    <FileText className="h-4 w-4 flex-shrink-0 opacity-80" />
                  )}
                  <span className="min-w-0 flex-1 truncate font-medium">{att.name}</span>
                  <span className="flex-shrink-0 text-xs opacity-80">{formatFileSize(att.size)}</span>
                </a>
              )}
            </div>
          )}

          {message.content ? (
            <p className="break-words whitespace-pre-wrap">{message.content}</p>
          ) : att && !isImage ? (
            <p className={cn('text-xs opacity-90', !isMine && 'text-[var(--dash-text-muted)]')}>
              Attachment
            </p>
          ) : null}

          <div
            className={cn(
              'mt-1.5 flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[10px] select-none',
              isMine ? 'text-orange-100' : 'text-[var(--dash-text-muted)]'
            )}
          >
            <span>{timeAgo(message.createdAt)}</span>
            {isMine && message.type !== 'SYSTEM' && (
              <span className="inline-flex items-center gap-0.5" aria-hidden>
                {uploading && <Loader2 className="h-3 w-3 animate-spin" />}
                {message.uploadStatus === 'success' && <Check className="h-3 w-3" />}
                {failed && <AlertCircle className="h-3 w-3 text-red-200" />}
              </span>
            )}
          </div>
        </div>

        {isMine && failed && message.localFile && onRetryUpload && (
          <button
            type="button"
            onClick={() => onRetryUpload(message)}
            className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            Upload failed — tap to retry
          </button>
        )}
      </div>
    </div>
  );
}
