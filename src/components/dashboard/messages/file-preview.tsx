'use client';

import { FileText, ImageIcon, X } from 'lucide-react';
import { cn, formatFileSize } from '@/src/lib/utils';

interface FilePreviewProps {
  file: File;
  previewUrl: string | null;
  onRemove: () => void;
  disabled?: boolean;
}

export function FilePreview({ file, previewUrl, onRemove, disabled }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-2.5 pr-2',
        'max-w-full'
      )}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--dash-card)]">
        {isImage && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : isImage ? (
          <ImageIcon className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden />
        ) : (
          <FileText className="h-6 w-6 text-[var(--dash-text-muted)]" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--dash-text)]" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-[var(--dash-text-muted)]">
          {file.type || 'File'} · {formatFileSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
          'text-[var(--dash-text-muted)] hover:bg-[var(--dash-card)] hover:text-[var(--dash-text)]',
          'transition-colors disabled:opacity-40'
        )}
        aria-label="Remove attachment"
      >
        <X size={18} />
      </button>
    </div>
  );
}
