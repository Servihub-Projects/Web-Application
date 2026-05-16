import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { initializeEscrowPayment, isDatabaseConfigured } from '@/src/lib/escrow/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const bodySchema = z.object({
  bookingId: z.string().min(1),
  callbackUrl: z.url().optional(),
  idempotencyKey: z.string().min(8).max(160).optional(),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database-backed escrow is not configured.' }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user || user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Only authenticated clients can initialize escrow payments.' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  try {
    const result = await initializeEscrowPayment({
      bookingId: parsed.data.bookingId,
      clientId: user.id,
      callbackUrl: parsed.data.callbackUrl,
      idempotencyKey: parsed.data.idempotencyKey,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to initialize escrow payment.' },
      { status: 400 }
    );
  }
}
