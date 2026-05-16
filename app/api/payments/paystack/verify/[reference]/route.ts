import { NextResponse } from 'next/server';
import { isDatabaseConfigured, verifyAndConfirmPaystackPayment } from '@/src/lib/escrow/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ reference: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database-backed escrow is not configured.' }, { status: 503 });
  }

  const { reference } = await params;
  if (!reference) {
    return NextResponse.json({ error: 'Payment reference is required.' }, { status: 400 });
  }

  try {
    const result = await verifyAndConfirmPaystackPayment(reference);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to verify payment.' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  return POST(request, context);
}
