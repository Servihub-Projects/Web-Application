'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  BriefcaseBusiness, Plus, Clock, MapPin, ChevronDown,
  ChevronUp, Trash2, ArchiveRestore, Archive,
} from 'lucide-react';
import { formatDate } from '@/src/lib/utils';
import { useCurrency } from '@/src/hooks/useCurrency';
import { closeJobAction, reopenJobAction, deleteJobAction } from '@/src/actions/jobs';
import PostJobModal from './post-job-modal';
import EmptyState from '../shared/empty-state';
import type { JobRequest } from '@/src/lib/types';

const STATUS_TABS = [
  { key: 'ALL',    label: 'All' },
  { key: 'OPEN',   label: 'Open' },
  { key: 'CLOSED', label: 'Closed' },
] as const;

type TabKey = (typeof STATUS_TABS)[number]['key'];

const URGENCY_LABEL: Record<string, string> = {
  FLEXIBLE: 'Flexible',
  WITHIN_WEEK: 'Within a week',
  URGENT: 'Urgent',
};

const URGENCY_COLOR: Record<string, string> = {
  FLEXIBLE: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30',
  WITHIN_WEEK: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30',
  URGENT: 'bg-red-50 text-red-700 dark:bg-red-950/30',
};

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30',
  ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30',
  CLOSED: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800',
};

function JobCard({ job, onMutate }: { job: JobRequest; onMutate: () => void }) {
  const format = useCurrency((s) => s.format);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    startTransition(async () => {
      await closeJobAction(job.id);
      onMutate();
    });
  };

  const handleReopen = () => {
    startTransition(async () => {
      await reopenJobAction(job.id);
      onMutate();
    });
  };

  const handleDelete = () => {
    if (!confirm('Delete this job listing? This cannot be undone.')) return;
    startTransition(async () => {
      await deleteJobAction(job.id);
      onMutate();
    });
  };

  const hasBudget = job.budgetMin > 0 || job.budgetMax > 0;

  return (
    <div className={`card p-4 space-y-3 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[job.status]}`}>
              {job.status === 'OPEN' ? 'Open' : job.status === 'ASSIGNED' ? 'Assigned' : 'Closed'}
            </span>
            <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${URGENCY_COLOR[job.urgency]}`}>
              {URGENCY_LABEL[job.urgency]}
            </span>
            <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--dash-bg)] text-[var(--dash-text-muted)]">
              {job.category}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[var(--dash-text)] line-clamp-1">{job.title}</h3>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-1.5 rounded-lg text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] transition-colors flex-shrink-0"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--dash-text-muted)]">
        <span className="flex items-center gap-1">
          <MapPin size={11} /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> Posted {formatDate(job.createdAt)}
        </span>
        {hasBudget && (
          <span className="font-medium text-[var(--dash-text)]">
            {job.budgetMin > 0 && job.budgetMax > 0
              ? `${format(job.budgetMin)} – ${format(job.budgetMax)}`
              : job.budgetMin > 0
              ? `From ${format(job.budgetMin)}`
              : `Up to ${format(job.budgetMax)}`}
          </span>
        )}
      </div>

      {/* Expanded description */}
      {expanded && (
        <p className="text-sm text-[var(--dash-text-muted)] leading-relaxed border-t border-[var(--dash-border)] pt-3">
          {job.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-[var(--dash-border)]">
        {job.status === 'OPEN' ? (
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 text-xs text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] font-medium px-2.5 py-1.5 rounded-lg hover:bg-[var(--dash-bg)] transition-colors"
          >
            <Archive size={13} /> Close listing
          </button>
        ) : job.status === 'CLOSED' ? (
          <button
            onClick={handleReopen}
            className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
          >
            <ArchiveRestore size={13} /> Reopen
          </button>
        ) : null}

        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ml-auto"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

interface JobsListProps {
  jobs: JobRequest[];
}

export default function JobsList({ jobs }: JobsListProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('ALL');
  const [postOpen, setPostOpen] = useState(false);

  const handleMutate = () => router.refresh();

  const filtered = jobs.filter((j) => tab === 'ALL' || j.status === tab);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--dash-bg)] rounded-lg p-1">
          {STATUS_TABS.map(({ key, label }) => {
            const count = key === 'ALL' ? jobs.length : jobs.filter((j) => j.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === key
                    ? 'bg-[var(--dash-card)] text-[var(--dash-text)] shadow-sm'
                    : 'text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    tab === key ? 'bg-orange-100 text-orange-600' : 'bg-[var(--dash-border)] text-[var(--dash-text-muted)]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPostOpen(true)}
          className="btn-primary flex items-center gap-2 py-2"
        >
          <Plus size={15} /> Post a job
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title={tab === 'ALL' ? 'No jobs posted yet' : `No ${tab.toLowerCase()} jobs`}
          description={
            tab === 'ALL'
              ? 'Post your first job listing to find skilled providers in your area.'
              : `You have no ${tab.toLowerCase()} job listings.`
          }
          action={tab === 'ALL' ? undefined : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} onMutate={handleMutate} />
          ))}
        </div>
      )}

      {postOpen && (
        <PostJobModal
          onClose={() => setPostOpen(false)}
          onSuccess={() => {
            setPostOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
