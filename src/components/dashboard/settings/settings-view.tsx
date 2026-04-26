'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Camera, X, Eye, EyeOff, Loader2, Lock, Pencil,
  BadgeCheck, Shield, Mail, MapPin, DollarSign, User as UserIcon,
  FileText, Check,
} from 'lucide-react';
import { cn, initials } from '@/src/lib/utils';
import { updateProfileAction, changePasswordAction } from '@/src/actions/profile';
import { CURRENCIES, NIGERIAN_STATES } from '@/src/lib/constants/currencies';
import type { SessionUser, CurrencyCode } from '@/src/lib/types';

// ─── Shared primitives ──────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-md bg-[var(--dash-card)] rounded-2xl border border-[var(--dash-border)] shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dash-border)]">
          <h3 className="text-base font-semibold text-[var(--dash-text)]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label, error, children, htmlFor,
}: {
  label: string; error?: string; children: React.ReactNode; htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
      {message}
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
      <Check size={14} className="flex-shrink-0" />
      {message}
    </div>
  );
}

function ModalFooter({ onCancel, isPending, submitLabel }: { onCancel: () => void; isPending: boolean; submitLabel: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel} className="flex-1 btn-secondary py-2 text-sm">
        Cancel
      </button>
      <button type="submit" disabled={isPending} className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2">
        {isPending && <Loader2 size={14} className="animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof UserIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-[var(--dash-text-muted)] mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-[var(--dash-text-muted)]">{label}</p>
        <p className="text-sm font-medium text-[var(--dash-text)] mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Edit Profile Modal ──────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(60),
  email: z.string().email('Enter a valid email address.'),
  location: z.string().optional(),
  preferredCurrency: z.enum(['NGN', 'USD', 'GBP', 'EUR', 'GHS']),
  bio: z.string().max(300, 'Bio must be under 300 characters.').optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

function EditProfileModal({
  user, onClose, onSuccess,
}: { user: SessionUser; onClose: () => void; onSuccess: (updated: SessionUser) => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      location: user.location ?? '',
      preferredCurrency: user.preferredCurrency,
      bio: user.bio ?? '',
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('email', data.email);
      if (data.location) fd.append('location', data.location);
      fd.append('preferredCurrency', data.preferredCurrency);
      if (data.bio) fd.append('bio', data.bio);

      const result = await updateProfileAction(fd);
      if ('error' in result) {
        setError(result.error);
      } else {
        onSuccess({
          ...user,
          name: data.name,
          email: data.email,
          location: data.location || undefined,
          preferredCurrency: data.preferredCurrency as CurrencyCode,
          bio: data.bio || undefined,
        });
      }
    });
  };

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorBanner message={error} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" error={errors.name?.message} htmlFor="ep-name">
            <input id="ep-name" type="text" autoComplete="name" className="input-field" {...register('name')} />
          </Field>
          <Field label="Email address" error={errors.email?.message} htmlFor="ep-email">
            <input id="ep-email" type="email" autoComplete="email" className="input-field" {...register('email')} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Location">
            <select className="input-field text-sm" {...register('location')}>
              <option value="">Not set</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Preferred currency">
            <select className="input-field text-sm" {...register('preferredCurrency')}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Bio (optional)" error={errors.bio?.message} htmlFor="ep-bio">
          <textarea
            id="ep-bio"
            className="input-field resize-none"
            rows={3}
            placeholder="Tell providers a bit about yourself…"
            {...register('bio')}
          />
          <p className="mt-1 text-xs text-[var(--dash-text-muted)]">Max 300 characters</p>
        </Field>

        <ModalFooter onCancel={onClose} isPending={isPending} submitLabel="Save changes" />
      </form>
    </Modal>
  );
}

// ─── Change Password Modal ───────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormValues) => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('currentPassword', data.currentPassword);
      fd.append('newPassword', data.newPassword);
      fd.append('confirmPassword', data.confirmPassword);

      const result = await changePasswordAction(fd);
      if ('error' in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        reset();
        setTimeout(onClose, 1800);
      }
    });
  };

  return (
    <Modal title="Change Password" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        {success && <SuccessBanner message="Password updated successfully." />}

        <Field label="Current password" error={errors.currentPassword?.message} htmlFor="cp-current">
          <div className="relative">
            <input
              id="cp-current"
              type={showCurrent ? 'text' : 'password'}
              autoComplete="current-password"
              className="input-field pr-10"
              {...register('currentPassword')}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <Field label="New password" error={errors.newPassword?.message} htmlFor="cp-new">
          <div className="relative">
            <input
              id="cp-new"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              className="input-field pr-10"
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <Field label="Confirm new password" error={errors.confirmPassword?.message} htmlFor="cp-confirm">
          <input
            id="cp-confirm"
            type="password"
            autoComplete="new-password"
            className="input-field"
            {...register('confirmPassword')}
          />
        </Field>

        <ModalFooter onCancel={onClose} isPending={isPending} submitLabel="Update password" />
      </form>
    </Modal>
  );
}

// ─── Main SettingsView ───────────────────────────────────────────────────────

export default function SettingsView({ user: initialUser }: { user: SessionUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`sh_avatar_${user.id}`);
    if (stored) setAvatarSrc(stored);
  }, [user.id]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      localStorage.setItem(`sh_avatar_${user.id}`, dataUrl);
      setAvatarSrc(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  const currency = CURRENCIES.find((c) => c.code === user.preferredCurrency) ?? CURRENCIES[0];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Settings</h1>
        <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">Manage your account preferences.</p>
      </div>

      {/* Profile card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--dash-text)]">Profile</h2>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            <Pencil size={13} /> Edit profile
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative group w-16 h-16 rounded-full overflow-hidden flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            aria-label="Update profile picture"
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-orange-600 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950/50 dark:to-orange-900/50">
                {initials(user.name)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--dash-text)] truncate">{user.name}</p>
            <p className="text-xs text-[var(--dash-text-muted)] mt-0.5 truncate">{user.email}</p>
            <span
              className={cn(
                'inline-flex mt-2 text-xs font-medium px-2 py-0.5 rounded-full',
                user.role === 'PROVIDER'
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/40'
                  : 'bg-green-50 text-green-700 dark:bg-green-950/40'
              )}
            >
              {user.role === 'PROVIDER' ? 'Provider' : 'Client'}
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--dash-border)]">
          <InfoRow icon={UserIcon} label="Full name" value={user.name} />
          <InfoRow icon={Mail} label="Email address" value={user.email} />
          <InfoRow icon={MapPin} label="Location" value={user.location ?? 'Not set'} />
          <InfoRow icon={DollarSign} label="Currency" value={`${currency.symbol} ${currency.code} — ${currency.name}`} />
          {user.bio && (
            <div className="sm:col-span-2">
              <InfoRow icon={FileText} label="Bio" value={user.bio} />
            </div>
          )}
        </div>
      </div>

      {/* Security card */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--dash-text)]">Security</h2>

        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--dash-bg)]">
          <div className="flex items-center gap-3">
            <Lock size={15} className="text-[var(--dash-text-muted)] flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--dash-text)]">Password</p>
              <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">Keep your account secure</p>
            </div>
          </div>
          <button
            onClick={() => setPwOpen(true)}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors flex-shrink-0 ml-4"
          >
            Change
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--dash-bg)]">
          <Shield size={15} className="text-green-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--dash-text)]">Account verified</p>
            <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
              Your identity has been verified and your account is in good standing.
            </p>
          </div>
          <BadgeCheck size={15} className="text-green-500 flex-shrink-0" />
        </div>
      </div>

      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSuccess={(updated) => {
            setUser(updated);
            setEditOpen(false);
            router.refresh();
          }}
        />
      )}

      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </div>
  );
}
