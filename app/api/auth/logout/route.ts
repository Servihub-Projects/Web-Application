import { NextResponse } from 'next/server';
import { logout } from '@/src/lib/auth/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await logout();
  return new NextResponse(null, { status: 204 });
}
