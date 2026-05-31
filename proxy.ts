import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/src/lib/auth/session-constants';
import { parseSessionTokenEdge } from '@/src/lib/auth/session-token-edge';

const AUTH_ONLY_PREFIXES = ['/login', '/register'] as const;
// Single source of truth for the provider-onboarding gate. This MUST match the
// real route (app/dashboard/add-details). The page is nested under the dashboard
// layout, so the gate has to live here in middleware — a server-component layout
// cannot read the current pathname and therefore cannot exempt the setup page
// from its own redirect, which is what caused the infinite redirect loop.
const PROVIDER_DETAILS_PATH = '/dashboard/add-details';

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const raw = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = raw ? await parseSessionTokenEdge(raw) : null;

  const isProviderDetailsPage = pathname === PROVIDER_DETAILS_PATH;
  const isProtected = pathname.startsWith('/dashboard') || isProviderDetailsPage;
  const isAuthPage = AUTH_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const needsProviderDetails =
    user?.role === 'PROVIDER' && user.providerDetailsCompleted === false;

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (isProtected && needsProviderDetails && !isProviderDetailsPage) {
    return NextResponse.redirect(new URL(PROVIDER_DETAILS_PATH, req.url));
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(
      new URL(needsProviderDetails ? PROVIDER_DETAILS_PATH : '/dashboard', req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/add-details',
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/login/:path*',
    '/register',
    '/register/:path*',
  ],
};
