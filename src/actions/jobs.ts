'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { MOCK_JOB_REQUESTS } from '@/src/lib/constants/mockData';
import type { JobRequest, ServiceCategory, JobUrgency } from '@/src/lib/types';

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

  const job: JobRequest = {
    id: `job_${Date.now()}`,
    clientId: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category as ServiceCategory,
    budgetMin: parsed.data.budgetMin ?? 0,
    budgetMax: parsed.data.budgetMax ?? 0,
    location: parsed.data.location,
    urgency: parsed.data.urgency as JobUrgency,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  // In production: await prisma.jobRequest.create({ data: job });
  MOCK_JOB_REQUESTS.push(job);
  revalidatePath('/dashboard/jobs');
  return { success: true };
}

export async function closeJobAction(jobId: string): Promise<JobActionResult> {
  const parsed = jobIdSchema.safeParse(jobId);
  if (!parsed.success) return { error: 'Invalid job ID.' };

  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const job = MOCK_JOB_REQUESTS.find((j) => j.id === parsed.data && j.clientId === user.id);
  if (!job) return { error: 'Job not found.' };

  // In production: await prisma.jobRequest.update({ where: { id: jobId }, data: { status: 'CLOSED' } });
  job.status = 'CLOSED';
  revalidatePath('/dashboard/jobs');
  return { success: true };
}

export async function reopenJobAction(jobId: string): Promise<JobActionResult> {
  const parsed = jobIdSchema.safeParse(jobId);
  if (!parsed.success) return { error: 'Invalid job ID.' };

  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const job = MOCK_JOB_REQUESTS.find((j) => j.id === parsed.data && j.clientId === user.id);
  if (!job) return { error: 'Job not found.' };

  job.status = 'OPEN';
  revalidatePath('/dashboard/jobs');
  return { success: true };
}

export async function deleteJobAction(jobId: string): Promise<JobActionResult> {
  const parsed = jobIdSchema.safeParse(jobId);
  if (!parsed.success) return { error: 'Invalid job ID.' };

  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const idx = MOCK_JOB_REQUESTS.findIndex((j) => j.id === parsed.data && j.clientId === user.id);
  if (idx === -1) return { error: 'Job not found.' };

  // In production: await prisma.jobRequest.delete({ where: { id: jobId } });
  MOCK_JOB_REQUESTS.splice(idx, 1);
  revalidatePath('/dashboard/jobs');
  return { success: true };
}
