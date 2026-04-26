import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon size={24} className="text-[var(--dash-text-muted)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--dash-text)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--dash-text-muted)] max-w-xs">{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary mt-5 inline-block px-5 py-2 text-sm">
          {action.label}
        </Link>
      )}
    </div>
  );
}
