import { EscrowReleaseType } from '@/generated/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { isDatabaseConfigured, releaseEscrow } from '@/src/lib/escrow/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const bodySchema = z.object({
  bookingId: z.string().min(1),
  amount: z.union([z.number().positive(), z.string().min(1)]).optional(),
  milestoneId: z.string().min(1).optional(),
  idempotencyKey: z.string().min(8).max(160),
  releaseType: z.enum(['PARTIAL', 'FULL', 'FINAL', 'ADMIN']).optional(),
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database-backed escrow is not configured.' }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  try {
    const result = await releaseEscrow({
      bookingId: parsed.data.bookingId,
      actorUserId: user.id,
      amount: parsed.data.amount,
      milestoneId: parsed.data.milestoneId,
      idempotencyKey: parsed.data.idempotencyKey,
      releaseType: parsed.data.releaseType
        ? EscrowReleaseType[parsed.data.releaseType]
        : undefined,
      reason: parsed.data.reason,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to release escrow.' },
      { status: 400 }
    );
  }
}
