'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useResetPassword } from '@/src/hooks/useAuth';


const schema = z.object({
  email: z.email('Enter a valid email address.'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const { sendResetPasswordEmail, isPending } = useResetPassword()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data: FormValues) => {
    sendResetPasswordEmail(data)
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl mx-auto">
      {errors.root && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {errors.root?.message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="input-field"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isPending}
        className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
      >
        {isSubmitting || isPending ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Remember your password?{' '}
        <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
