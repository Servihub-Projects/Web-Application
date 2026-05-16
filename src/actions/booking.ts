'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { MOCK_BOOKINGS } from '@/src/lib/constants/mockData';
import { getCurrentUser } from '@/src/lib/auth/auth';
import {
  acceptBookingForEscrow,
  completeJobWorkflow,
  declineBookingForEscrow,
  isDatabaseConfigured,
} from '@/src/lib/escrow/service';
import type { CompleteJobResult } from '@/src/lib/types';

const PLATFORM_FEE_RATE = 0.10;

const bookingIdSchema = z.string().min(1).max(100).regex(/^[\w-]+$/, 'Invalid booking ID.');

export async function completeJobAction(bookingId: string): Promise<CompleteJobResult> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  if (isDatabaseConfigured()) {
    try {
      const result = await completeJobWorkflow({
        bookingId: parsed.data,
        actorUserId: user.id,
      });
      revalidatePath('/dashboard', 'layout');
      if (result.released && 'release' in result && result.release) {
        const { release } = result;
        return {
          success: true,
          escrowBreakdown: {
            totalAmount: Number(release.amount),
            upfrontPaid: 0,
            completionRelease: Number(release.workerNetAmount),
            platformFee: Number(release.platformFeeAmount),
            providerReceives: Number(release.workerNetAmount),
          },
        };
      }
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to complete this booking.',
      };
    }
  }

  const booking = MOCK_BOOKINGS.find((b) => b.id === parsed.data);
  if (!booking) return { success: false, error: 'Booking not found.' };

  if (booking.clientId !== user.id && booking.providerId !== user.id) {
    return { success: false, error: 'Not authorised to complete this booking.' };
  }

  if (booking.status !== 'IN_PROGRESS') {
    return {
      success: false,
      error: `Cannot complete a booking with status "${booking.status}".`,
    };
  }

  const platformFee = booking.totalAmount * PLATFORM_FEE_RATE;
  const upfrontPaid = booking.totalAmount * 0.5;
  const completionRelease = booking.totalAmount * 0.5 - platformFee;
  const providerReceives = upfrontPaid + completionRelease;

  // In production: wrap in a DB transaction — update booking status, create
  // escrow transactions for COMPLETION_RELEASE and PLATFORM_FEE in one atomic operation.
  const updatedBooking = {
    ...booking,
    status: 'COMPLETED' as const,
    completionPaid: true,
    completionDate: new Date().toISOString(),
  };

  return {
    success: true,
    updatedBooking,
    escrowBreakdown: {
      totalAmount: booking.totalAmount,
      upfrontPaid,
      completionRelease,
      platformFee,
      providerReceives,
    },
  };
}

export async function acceptBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user || user.role !== 'PROVIDER') return { success: false, error: 'Not authorised.' };

  if (isDatabaseConfigured()) {
    try {
      await acceptBookingForEscrow({ bookingId: parsed.data, providerId: user.id });
      revalidatePath('/dashboard', 'layout');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unable to accept booking.' };
    }
  }

  const booking = MOCK_BOOKINGS.find((b) => b.id === parsed.data);
  if (!booking || booking.providerId !== user.id) return { success: false, error: 'Booking not found.' };

  if (booking.status !== 'PENDING') {
    return { success: false, error: 'Only pending bookings can be accepted.' };
  }

  // In production: prisma.booking.update({ where: { id: bookingId }, data: { status: 'ESCROW_PAID' } });
  return { success: true };
}

export async function declineBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user || user.role !== 'PROVIDER') return { success: false, error: 'Not authorised.' };

  if (isDatabaseConfigured()) {
    try {
      await declineBookingForEscrow({ bookingId: parsed.data, providerId: user.id });
      revalidatePath('/dashboard', 'layout');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unable to decline booking.' };
    }
  }

  const booking = MOCK_BOOKINGS.find((b) => b.id === parsed.data);
  if (!booking || booking.providerId !== user.id) return { success: false, error: 'Booking not found.' };

  if (!['PENDING', 'ESCROW_PAID'].includes(booking.status)) {
    return { success: false, error: 'This booking cannot be declined.' };
  }

  // In production: DB update + trigger escrow refund if applicable.
  return { success: true };
}
