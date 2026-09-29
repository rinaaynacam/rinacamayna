import { NextResponse, type NextRequest } from 'next/server';
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.toLowerCase().replace(/\/+$/, '');
  if (/\/api\/yoneticiler\/(first-register|forgot-password|reset-password)$/.test(pathname)) {
    return NextResponse.json({ error: 'Bu işlem kapalı.' }, { status: 404 });
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*', '/api/yoneticiler/:path*'] };
