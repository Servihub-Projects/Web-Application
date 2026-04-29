import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'sh_session';

const PROTECTED = ['/dashboard'];
const AUTH_ONLY = ['/login', '/register'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get(SESSION_COOKIE);

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
