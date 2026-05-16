import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { isDatabaseConfigured, reconcilePaystackReference } from '@/src/lib/escrow/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const bodySchema = z.object({
  reference: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database-backed escrow is not configured.' }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  try {
    const result = await reconcilePaystackReference(parsed.data.reference);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to reconcile Paystack payment.' },
      { status: 400 }
    );
  }
}
