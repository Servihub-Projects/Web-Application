import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user });
}
