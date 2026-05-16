import { NextResponse } from 'next/server';
import { isDatabaseConfigured, recordPaystackWebhook } from '@/src/lib/escrow/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database-backed escrow is not configured.' }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  try {
    const result = await recordPaystackWebhook({ rawBody, signature });
    if (!result.accepted) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ received: true, duplicate: result.duplicate ?? false });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to process Paystack webhook.' },
      { status: 500 }
    );
  }
}
