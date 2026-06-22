'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { prisma } from '@/src/lib/prisma';
import {
  createBooking,
  createNotification,
  getJobRequestById,
  getProviderProposalService,
  getServiceById,
  markJobRequestAssigned,
} from '@/src/lib/data';
import type { BookingActionResult, CompleteJobResult } from '@/src/lib/types';

const bookingIdSchema = z.string().min(1).max(100).regex(/^[\w-]+$/, 'Invalid booking ID.');

const amountSchema = z
  .number()
  .finite('Enter a valid amount.')
  .min(1, 'Amount must be greater than zero.')
  .max(1_000_000_000, 'Amount is too large.');

function revalidateBookingSurfaces() {
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/my-hires');
  revalidatePath('/dashboard/bookings');
  revalidatePath('/dashboard/find-clients');
  revalidatePath('/dashboard/analytics');
}

// ---------------------------------------------------------------------------
// Client → Provider: hire a provider for a specific service.
// ---------------------------------------------------------------------------

const hireSchema = z.object({
  serviceId: z.string().min(1).max(100),
  description: z
    .string()
    .trim()
    .min(20, 'Describe the job in at least 20 characters.')
    .max(1000, 'Keep the job description under 1000 characters.'),
  totalAmount: amountSchema,
  startDate: z
    .string()
    .min(1, 'Choose a preferred start date.')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Choose a valid start date.'),
});

export type HireProviderInput = z.infer<typeof hireSchema>;

export async function hireProviderAction(input: HireProviderInput): Promise<BookingActionResult> {
  const parsed = hireSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid hire details.' };
  }

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Please sign in to hire a provider.' };
  if (user.role !== 'CLIENT') return { success: false, error: 'Only clients can hire providers.' };

  const service = await getServiceById(parsed.data.serviceId);
  if (!service) return { success: false, error: 'This service is no longer available.' };
  if (service.provider.id === user.id) {
    return { success: false, error: 'You cannot hire yourself.' };
  }

  const open = await prisma.booking.findFirst({
    where: {
      clientId: user.id,
      serviceId: service.id,
      status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
    },
    select: { id: true },
  });
  if (open) {
    return { success: false, error: 'You already have an active booking for this service.' };
  }

  const booking = await createBooking({
    serviceId: service.id,
    clientId: user.id,
    providerId: service.provider.id,
    status: 'PENDING',
    initiatedBy: 'CLIENT',
    totalAmount: parsed.data.totalAmount,
    description: parsed.data.description,
    startDate: new Date(parsed.data.startDate).toISOString(),
  });

  await createNotification({
    userId: service.provider.id,
    type: 'BOOKING_REQUEST',
    title: 'New booking request',
    body: `${user.name} wants to hire you for "${service.title}".`,
    actionUrl: '/dashboard/bookings',
  });

  revalidateBookingSurfaces();
  return { success: true, bookingId: booking.id };
}

// ---------------------------------------------------------------------------
// Provider → Client: send a proposal in response to a job request.
// ---------------------------------------------------------------------------

const proposalSchema = z.object({
  jobRequestId: z.string().min(1).max(100),
  message: z
    .string()
    .trim()
    .min(20, 'Write at least 20 characters so the client understands your proposal.')
    .max(1000, 'Keep your proposal under 1000 characters.'),
  amount: amountSchema,
  startDate: z
    .string()
    .min(1, 'Choose a proposed start date.')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Choose a valid start date.'),
});

export type SendProposalInput = z.infer<typeof proposalSchema>;

export async function sendProposalAction(input: SendProposalInput): Promise<BookingActionResult> {
  const parsed = proposalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid proposal details.' };
  }
  console.log(parsed)

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Please sign in to send a proposal.' };
  if (user.role !== 'PROVIDER') return { success: false, error: 'Only providers can send proposals.' };

  console.log(parsed.data.jobRequestId)
  const jobRequest = await getJobRequestById(parsed.data.jobRequestId);
  if (!jobRequest) return { success: false, error: 'This job request is no longer available.' };
  if (jobRequest.status !== 'OPEN') {
    return { success: false, error: 'This job request is no longer accepting proposals.' };
  }
  if (jobRequest.clientId === user.id) {
    return { success: false, error: 'You cannot propose on your own job request.' };
  }

  const existing = await prisma.booking.findFirst({
    where: {
      jobRequestId: jobRequest.id,
      providerId: user.id,
      status: { in: ['PROPOSAL_SENT', 'ACCEPTED', 'IN_PROGRESS'] },
    },
    select: { id: true },
  });
  if (existing) {
    return { success: false, error: 'You have already sent a proposal for this job.' };
  }

  const service = await getProviderProposalService(user.id, jobRequest.category);
  if (!service) {
    return {
      success: false,
      error: 'Add a service to your profile before sending proposals.',
    };
  }

  const booking = await createBooking({
    serviceId: service.id,
    clientId: jobRequest.clientId,
    providerId: user.id,
    status: 'PROPOSAL_SENT',
    initiatedBy: 'PROVIDER',
    totalAmount: parsed.data.amount,
    description: jobRequest.title,
    proposalMessage: parsed.data.message,
    jobRequestId: jobRequest.id,
    startDate: new Date(parsed.data.startDate).toISOString(),
  });

  await createNotification({
    userId: jobRequest.clientId,
    type: 'BOOKING_REQUEST',
    title: 'New proposal received',
    body: `${user.name} sent a proposal for "${jobRequest.title}".`,
    actionUrl: '/dashboard/my-hires',
  });

  revalidateBookingSurfaces();
  return { success: true, bookingId: booking.id };
}

// ---------------------------------------------------------------------------
// Client reviews a provider's proposal: accept or reject.
// ---------------------------------------------------------------------------

export async function acceptProposalAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user || user.role !== 'CLIENT') return { success: false, error: 'Not authorised.' };

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data, clientId: user.id },
    select: { id: true, status: true, providerId: true, jobRequestId: true },
  });
  if (!booking) return { success: false, error: 'Proposal not found.' };
  if (booking.status !== 'PROPOSAL_SENT') {
    return { success: false, error: 'This proposal can no longer be accepted.' };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'ACCEPTED' },
  });

  if (booking.jobRequestId) await markJobRequestAssigned(booking.jobRequestId);

  await createNotification({
    userId: booking.providerId,
    type: 'BOOKING_ACCEPTED',
    title: 'Proposal accepted',
    body: `${user.name} accepted your proposal. You can start coordinating the work.`,
    actionUrl: '/dashboard/bookings',
  });

  revalidateBookingSurfaces();
  return { success: true };
}

export async function rejectProposalAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user || user.role !== 'CLIENT') return { success: false, error: 'Not authorised.' };

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data, clientId: user.id },
    select: { id: true, status: true, providerId: true, description: true },
  });
  if (!booking) return { success: false, error: 'Proposal not found.' };
  if (booking.status !== 'PROPOSAL_SENT') {
    return { success: false, error: 'This proposal can no longer be rejected.' };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'DECLINED' },
  });

  await createNotification({
    userId: booking.providerId,
    type: 'BOOKING_DECLINED',
    title: 'Proposal declined',
    body: `${user.name} declined your proposal for "${booking.description}".`,
    actionUrl: '/dashboard/find-clients',
  });

  revalidateBookingSurfaces();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Either party withdraws/cancels an open booking they are part of.
// ---------------------------------------------------------------------------

export async function cancelBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const booking = await prisma.booking.findFirst({
    where: {
      id: parsed.data,
      OR: [{ clientId: user.id }, { providerId: user.id }],
    },
    select: { id: true, status: true, clientId: true, providerId: true, description: true, jobRequestId: true },
  });
  if (!booking) return { success: false, error: 'Booking not found.' };

  if (!['PENDING', 'PROPOSAL_SENT', 'ACCEPTED'].includes(booking.status)) {
    return { success: false, error: `A ${booking.status.toLowerCase()} booking cannot be cancelled.` };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  if (booking.jobRequestId) {
    const { reopenJobRequest } = await import('@/src/lib/data');
    await reopenJobRequest(booking.jobRequestId);
  }

  const counterpartyId = booking.clientId === user.id ? booking.providerId : booking.clientId;
  await createNotification({
    userId: counterpartyId,
    type: 'BOOKING_DECLINED',
    title: 'Booking cancelled',
    body: `${user.name} cancelled "${booking.description}".`,
    actionUrl: user.role === 'CLIENT' ? '/dashboard/bookings' : '/dashboard/my-hires',
  });

  revalidateBookingSurfaces();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Either party marks a booking as complete.
// ---------------------------------------------------------------------------

export async function completeJobAction(bookingId: string): Promise<CompleteJobResult> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const booking = await prisma.booking.findFirst({
    where: {
      id: parsed.data,
      OR: [{ clientId: user.id }, { providerId: user.id }],
    },
    select: { id: true, status: true, clientId: true, providerId: true, description: true },
  });
  if (!booking) return { success: false, error: 'Booking not found.' };

  if (booking.status !== 'IN_PROGRESS' && booking.status !== 'ACCEPTED') {
    return {
      success: false,
      error: `Cannot complete a booking with status "${booking.status}".`,
    };
  }

  const completionDate = new Date();
  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'COMPLETED', completionDate },
  });

  const counterpartyId = booking.clientId === user.id ? booking.providerId : booking.clientId;
  await createNotification({
    userId: counterpartyId,
    type: 'BOOKING_COMPLETED',
    title: 'Job completed',
    body: `"${booking.description}" was marked complete.`,
    actionUrl: user.role === 'CLIENT' ? '/dashboard/bookings' : '/dashboard/analytics',
  });

  revalidateBookingSurfaces();
  return { success: true, updatedBooking };
}

// ---------------------------------------------------------------------------
// Provider responds to a client-initiated booking request.
// ---------------------------------------------------------------------------

export async function acceptBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user || user.role !== 'PROVIDER') return { success: false, error: 'Not authorised.' };

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data, providerId: user.id },
    select: { id: true, status: true, clientId: true, description: true },
  });
  if (!booking) return { success: false, error: 'Booking not found.' };

  if (booking.status !== 'PENDING') {
    return { success: false, error: 'Only pending bookings can be accepted.' };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'ACCEPTED' },
  });

  await createNotification({
    userId: booking.clientId,
    type: 'BOOKING_ACCEPTED',
    title: 'Booking accepted',
    body: `${user.name} accepted your booking for "${booking.description}".`,
    actionUrl: '/dashboard/my-hires',
  });

  revalidateBookingSurfaces();
  return { success: true };
}

export async function declineBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { success: false, error: 'Invalid booking ID.' };

  const user = await getCurrentUser();
  if (!user || user.role !== 'PROVIDER') return { success: false, error: 'Not authorised.' };

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data, providerId: user.id },
    select: { id: true, status: true, clientId: true, description: true },
  });
  if (!booking) return { success: false, error: 'Booking not found.' };

  if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
    return { success: false, error: 'This booking cannot be declined.' };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'DECLINED' },
  });

  await createNotification({
    userId: booking.clientId,
    type: 'BOOKING_DECLINED',
    title: 'Booking declined',
    body: `${user.name} could not take on "${booking.description}".`,
    actionUrl: '/dashboard/discover',
  });

  revalidateBookingSurfaces();
  return { success: true };
}
