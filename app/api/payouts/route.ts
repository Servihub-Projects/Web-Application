import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { isDatabaseConfigured, requestWorkerPayout } from '@/src/lib/escrow/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const bodySchema = z.object({
  amount: z.union([z.number().positive(), z.string().min(1)]),
  payoutAccountId: z.string().min(1),
  idempotencyKey: z.string().min(8).max(160),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database-backed escrow is not configured.' }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user || user.role !== 'PROVIDER') {
    return NextResponse.json({ error: 'Only authenticated providers can request payouts.' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  try {
    const result = await requestWorkerPayout({
      workerId: user.id,
      amount: parsed.data.amount,
      payoutAccountId: parsed.data.payoutAccountId,
      idempotencyKey: parsed.data.idempotencyKey,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create payout.' },
      { status: 400 }
    );
  }
}
