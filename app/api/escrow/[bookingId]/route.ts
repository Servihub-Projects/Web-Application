import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/lib/auth/auth';
import { getEscrowLifecycle, isDatabaseConfigured } from '@/src/lib/escrow/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ bookingId: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database-backed escrow is not configured.' }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { bookingId } = await params;
  try {
    const lifecycle = await getEscrowLifecycle({ bookingId, actorUserId: user.id });
    return NextResponse.json({ lifecycle });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load escrow lifecycle.' },
      { status: 403 }
    );
  }
}
