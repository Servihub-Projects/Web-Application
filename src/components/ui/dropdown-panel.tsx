'use client';

import type { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

type PanelAlign = 'left' | 'right';

/**
 * Themed popover shell: caps height to the viewport, clips chrome, and
 * delegates scrolling to {@link DropdownScrollArea} so wheel/touch stay contained.
 */
export function DropdownPanel({
  align = 'right',
  className,
  children,
}: {
  align?: PanelAlign;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="presentation"
      className={cn(
        'absolute z-50 mt-1.5 flex max-h-[min(520px,calc(100vh-5rem))] min-w-[13rem] flex-col overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-lg',
        align === 'right' ? 'right-0 top-full' : 'left-0 top-full',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownScrollArea({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'app-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownSection({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn('flex-shrink-0', className)}>{children}</div>;
}
