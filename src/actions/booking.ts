'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { MOCK_BOOKINGS } from '@/src/lib/constants/mockData';
import { getCurrentUser } from '@/src/lib/auth/auth';
import type { CompleteJobResult } from '@/src/lib/types';

const bookingIdSchema = z.string().min(1).max(100).regex(/^[\w-]+$/, 'Invalid booking ID.');

export async function completeJobAction(bookingId: string): Promise<CompleteJobResult> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const booking = MOCK_BOOKINGS.find((b) => b.id === parsed.data);
  if (!booking) return { success: false, error: 'Booking not found.' };

  if (booking.clientId !== user.id && booking.providerId !== user.id) {
    return { success: false, error: 'Not authorised to complete this booking.' };
  }

  if (booking.status !== 'IN_PROGRESS' && booking.status !== 'ACCEPTED') {
    return {
      success: false,
      error: `Cannot complete a booking with status "${booking.status}".`,
    };
  }

  const updatedBooking = {
    ...booking,
    status: 'COMPLETED' as const,
    completionDate: new Date().toISOString(),
  };

  booking.status = updatedBooking.status;
  booking.completionDate = updatedBooking.completionDate;

  revalidatePath('/dashboard', 'layout');
  return { success: true, updatedBooking };
}

export async function acceptBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user || user.role !== 'PROVIDER') return { success: false, error: 'Not authorised.' };

  const booking = MOCK_BOOKINGS.find((b) => b.id === parsed.data);
  if (!booking || booking.providerId !== user.id) return { success: false, error: 'Booking not found.' };

  if (booking.status !== 'PENDING') {
    return { success: false, error: 'Only pending bookings can be accepted.' };
  }

  booking.status = 'ACCEPTED';
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}

export async function declineBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user || user.role !== 'PROVIDER') return { success: false, error: 'Not authorised.' };

  const booking = MOCK_BOOKINGS.find((b) => b.id === parsed.data);
  if (!booking || booking.providerId !== user.id) return { success: false, error: 'Booking not found.' };

  if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
    return { success: false, error: 'This booking cannot be declined.' };
  }

  booking.status = 'DECLINED';
  revalidatePath('/dashboard', 'layout');
  return { success: true };
}
