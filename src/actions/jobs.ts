'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { prisma } from '@/src/lib/prisma';

export type JobActionResult = { error: string } | { success: true };

const jobIdSchema = z.string().min(1).max(100).regex(/^[\w-]+$/);

const SERVICE_CATEGORIES = [
  'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Masonry',
  'Interior Design', 'Landscaping', 'Cleaning', 'Security', 'HVAC', 'Roofing', 'Tiling',
] as const;

const createJobSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters.').max(100),
    description: z.string().min(20, 'Please provide more detail (min 20 characters).').max(1000),
    category: z.enum(SERVICE_CATEGORIES),
    budgetMin: z.coerce.number().min(0).optional(),
    budgetMax: z.coerce.number().min(0).optional(),
    location: z.string().min(1, 'Select a location.'),
    urgency: z.enum(['FLEXIBLE', 'WITHIN_WEEK', 'URGENT']),
  })
  .refine(
    (d) => {
      if (d.budgetMin !== undefined && d.budgetMax !== undefined && d.budgetMax > 0) {
        return d.budgetMax >= d.budgetMin;
      }
      return true;
    },
    { message: 'Max budget must be ≥ min budget.', path: ['budgetMax'] }
  );

export async function createJobAction(formData: FormData): Promise<JobActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };
  if (user.role !== 'CLIENT') return { error: 'Only clients can post jobs.' };

  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    budgetMin: formData.get('budgetMin') || undefined,
    budgetMax: formData.get('budgetMax') || undefined,
    location: formData.get('location'),
    urgency: formData.get('urgency'),
  };

  const parsed = createJobSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  try {
    await prisma.jobRequest.create({
      data: {
        clientId: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        budgetMin: parsed.data.budgetMin ?? 0,
        budgetMax: parsed.data.budgetMax ?? 0,
        location: parsed.data.location,
        urgency: parsed.data.urgency,
        status: 'OPEN',
      },
    });
  } catch {
    return { error: 'Failed to create job. Please try again.' };
  }

  revalidatePath('/dashboard/jobs');
  return { success: true };
}

export async function closeJobAction(jobId: string): Promise<JobActionResult> {
  const parsed = jobIdSchema.safeParse(jobId);
  if (!parsed.success) return { error: 'Invalid job ID.' };

  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const job = await prisma.jobRequest.findFirst({
    where: { id: parsed.data, clientId: user.id },
  });
  if (!job) return { error: 'Job not found.' };

  try {
    await prisma.jobRequest.update({
      where: { id: parsed.data },
      data: { status: 'CLOSED' },
    });
  } catch {
    return { error: 'Failed to close job. Please try again.' };
  }

  revalidatePath('/dashboard/jobs');
  return { success: true };
}

export async function reopenJobAction(jobId: string): Promise<JobActionResult> {
  const parsed = jobIdSchema.safeParse(jobId);
  if (!parsed.success) return { error: 'Invalid job ID.' };

  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const job = await prisma.jobRequest.findFirst({
    where: { id: parsed.data, clientId: user.id },
  });
  if (!job) return { error: 'Job not found.' };

  try {
    await prisma.jobRequest.update({
      where: { id: parsed.data },
      data: { status: 'OPEN' },
    });
  } catch {
    return { error: 'Failed to reopen job. Please try again.' };
  }

  revalidatePath('/dashboard/jobs');
  return { success: true };
}

export async function deleteJobAction(jobId: string): Promise<JobActionResult> {
  const parsed = jobIdSchema.safeParse(jobId);
  if (!parsed.success) return { error: 'Invalid job ID.' };

  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const job = await prisma.jobRequest.findFirst({
    where: { id: parsed.data, clientId: user.id },
  });
  if (!job) return { error: 'Job not found.' };

  try {
    await prisma.jobRequest.delete({
      where: { id: parsed.data },
    });
  } catch {
    return { error: 'Failed to delete job. Please try again.' };
  }

  revalidatePath('/dashboard/jobs');
  return { success: true };
}
